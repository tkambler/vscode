"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mm = require("micromatch");
const config_1 = require("./config");
const path = require("path");
function append(bgp, pattern) {
    if (!bgp) {
        return {
            head: pattern,
            tail: undefined,
        };
    }
    else {
        bgp.tail = append(bgp.tail, pattern);
        return bgp;
    }
}
function backslashPathSepAllowed() {
    if (path.sep === "/") {
        return false;
    }
    return config_1.getConfig("windows").allowBackslashAsPathSeparator;
}
function patternSplit(pattern) {
    let sep = "/";
    if (backslashPathSepAllowed()) {
        sep = /[\/\\]/;
    }
    return pattern.split(sep);
}
function patternJoin(parts) {
    return parts.join("/");
}
function patternResolve(basePath, pattern) {
    basePath = fixPathSeparators(basePath)
        .replace(/\/$/, "");
    let res;
    if (pattern) {
        res = basePath + "/" + pattern;
    }
    else {
        res = basePath;
    }
    return res;
}
/**
 * use "/" as dir separator for pattern
 * because "\" won't work properly with micromatch
 */
function fixPatternPathSeparators(pattern) {
    if (backslashPathSepAllowed()) {
        // if here "\" means dir separator not escaped char
        return pattern.replace(/\\/g, "/");
    }
    // here "\" means escaped char
    return pattern;
}
exports.fixPatternPathSeparators = fixPatternPathSeparators;
function getUnescapedPathSegment(ast) {
    let sb = "";
    for (const node of ast.nodes) {
        switch (node.type) {
            // basePathOkNodes
            case "bos":
            case "eos":
            case "text":
            case "escape":
            case "dot":
                sb += node.val;
                break;
            default:
                return null;
        }
    }
    return sb;
}
function parsePattern(pattern) {
    const parts = patternSplit(pattern);
    let kind = "inBasePath";
    const basePathParts = [];
    const patternParts = [];
    let beforeGlobstarParts;
    for (const part of parts) {
        if (kind !== "afterGlobstar") {
            const ast = mm.parse(part);
            if (ast.nodes.some(n => n.type === "globstar")) {
                kind = "afterGlobstar";
            }
            else if (kind === "inBasePath") {
                const pathPart = getUnescapedPathSegment(ast);
                if (pathPart !== null) {
                    basePathParts.push(pathPart);
                }
                else {
                    kind = "inPattern";
                }
            }
        }
        switch (kind) {
            case "inPattern":
                patternParts.push(part);
                beforeGlobstarParts = append(beforeGlobstarParts, part);
                break;
            case "afterGlobstar":
                patternParts.push(part);
                break;
        }
    }
    if (patternParts.length) {
        // to distinguish root [""] => ["", ""] => "/"
        // from relative path [] => [""] => ""
        basePathParts.push("");
    }
    const basePath = basePathParts.join(path.sep);
    const patternPart = patternParts.length
        ? patternJoin(patternParts)
        : null;
    return {
        basePath: basePath,
        beforGlobstarParts: beforeGlobstarParts,
        pattern: patternPart,
        hasGlobstar: kind === "afterGlobstar",
    };
}
exports.parsePattern = parsePattern;
/**
 * micromatch doesn't work properly with "\" as directory separator
 * replace with "/" for matching
 */
function fixPathSeparators(somePath) {
    if (path.sep === "\\") {
        return somePath.replace(/\\/g, "/");
    }
    return somePath;
}
exports.fixPathSeparators = fixPathSeparators;
function toFullPathPattern(pattern, cwd) {
    const home = process.env.HOME;
    if (home) {
        pattern = pattern.replace(/^(~|\$HOME)(?=\W|$)/, home);
    }
    const parsed = parsePattern(pattern);
    let basePath = parsed.basePath;
    let fullPattern = fixPatternPathSeparators(pattern);
    if (cwd && !path.isAbsolute(basePath)) {
        basePath = path.join(cwd, basePath);
        fullPattern = patternResolve(basePath, parsed.pattern);
    }
    return {
        basePath: basePath,
        beforGlobstarParts: parsed.beforGlobstarParts,
        fullPattern: fullPattern,
        hasGlobstar: parsed.hasGlobstar,
    };
}
exports.toFullPathPattern = toFullPathPattern;
//# sourceMappingURL=pathPattern.js.map