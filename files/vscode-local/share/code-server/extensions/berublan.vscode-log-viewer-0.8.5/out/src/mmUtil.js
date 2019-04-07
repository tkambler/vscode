"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mm = require("micromatch");
const pathPattern_1 = require("./pathPattern");
const myMmOptions = {
    dot: true,
    unixify: false,
};
function myIsMatch(somePath, pattern) {
    somePath = pathPattern_1.fixPathSeparators(somePath);
    return mm.isMatch(somePath, pattern, myMmOptions);
}
exports.myIsMatch = myIsMatch;
function myMatcher(pattern) {
    const matcher = mm.matcher(pattern, myMmOptions);
    if (path.sep === "\\") {
        //micromatch doesn't work properly with "\" as directory separator
        //replace with "/" for matching
        return (str) => matcher(str.replace(/\\/g, "/"));
    }
    else {
        return matcher;
    }
}
exports.myMatcher = myMatcher;
function toPathMatcher(pattern, options) {
    const p = pathPattern_1.toFullPathPattern(pattern, options && options.cwd);
    const fullPathMatcher = myMatcher(p.fullPattern);
    let nameIgnoreMatcher;
    if (options && options.nameIgnorePattern) {
        const nameIgnorePattern = pathPattern_1.fixPatternPathSeparators(options.nameIgnorePattern);
        nameIgnoreMatcher = myMatcher(nameIgnorePattern);
    }
    else {
        nameIgnoreMatcher = (_) => false;
    }
    return {
        basePath: p.basePath,
        patterns: p.beforGlobstarParts,
        hasGlobstar: p.hasGlobstar,
        fullPathMatcher: fullPathMatcher,
        nameIgnoreMatcher: nameIgnoreMatcher
    };
}
exports.toPathMatcher = toPathMatcher;
//# sourceMappingURL=mmUtil.js.map