"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const mmUtil_1 = require("./mmUtil");
function lsRec(dirpath, onFile, onError) {
    const onErr = onError || (() => { });
    return new Promise((resolve) => {
        let pending = 1;
        function decPending() {
            pending--;
            if (pending === 0) {
                resolve();
            }
        }
        const onStats = (path) => (err, stats) => {
            if (err) {
                onErr(err);
                decPending();
            }
            else if (stats.isDirectory()) {
                fs.readdir(path, onReaddir(path));
            }
            else {
                onFile({
                    fullPath: path,
                    stats: stats,
                });
                decPending();
            }
        };
        const onReaddir = (path) => (err, names) => {
            if (err) {
                onErr(err);
            }
            else {
                pending += names.length;
                for (const name of names) {
                    step(path_1.join(path, name));
                }
            }
            decPending();
        };
        function step(path) {
            fs.stat(path, onStats(path));
        }
        step(dirpath);
    });
}
exports.lsRec = lsRec;
function lsPattern(pathMatcher, onFile, onError) {
    const onErr = onError || (() => { });
    return new Promise((resolve) => {
        let pending = 1;
        function decPending() {
            pending--;
            if (pending === 0) {
                resolve();
            }
        }
        const onStats = (path, patternParts) => (err, stats) => {
            if (err) {
                onErr(err);
                decPending();
                return;
            }
            if (stats.isDirectory()) {
                if (patternParts || pathMatcher.hasGlobstar) {
                    fs.readdir(path, onReaddir(path, patternParts));
                }
                else {
                    decPending();
                }
            }
            else {
                if (!patternParts && pathMatcher.fullPathMatcher(path)) {
                    onFile({
                        fullPath: path,
                        stats: stats,
                    });
                }
                decPending();
            }
        };
        const onReaddir = (path, patternParts) => (err, names) => {
            if (err) {
                onErr(err);
            }
            else {
                const restParts = patternParts && patternParts.tail;
                for (const name of names) {
                    if (pathMatcher.nameIgnoreMatcher(name)) {
                        continue;
                    }
                    else if (patternParts && !mmUtil_1.myIsMatch(name, patternParts.head)) {
                        continue;
                    }
                    pending += 1;
                    const subPath = path_1.join(path, name);
                    step(subPath, restParts);
                }
            }
            decPending();
        };
        function step(path, patternParts) {
            fs.stat(path, onStats(path, patternParts));
        }
        step(pathMatcher.basePath, pathMatcher.patterns);
    });
}
exports.lsPattern = lsPattern;
class MyWalker {
    constructor(pathMatcher) {
        this.pathMatcher = pathMatcher;
    }
    walk(sub) {
        return lsPattern(this.pathMatcher, sub.onFile, sub.onError);
    }
}
exports.MyWalker = MyWalker;
//# sourceMappingURL=fsUtil.js.map