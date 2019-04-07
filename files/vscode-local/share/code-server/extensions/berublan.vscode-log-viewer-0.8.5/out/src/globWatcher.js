"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fse = require("fs-extra");
const path = require("path");
const config = require("./config");
const fsUtil_1 = require("./fsUtil");
const mmUtil_1 = require("./mmUtil");
const rgUtil_1 = require("./rgUtil");
const vscodeUtil_1 = require("./vscodeUtil");
const pathPattern_1 = require("./pathPattern");
function getWalker(watch, ignorePattern) {
    const cwd = vscodeUtil_1.getWorkspaceDir(watch.workspaceName);
    const useRg = config.getConfig("useRipgrep");
    if (useRg && rgUtil_1.rgPathFound()) {
        const pat = pathPattern_1.parsePattern(watch.pattern);
        let basePath = pat.basePath;
        if (cwd && !path.isAbsolute(basePath)) {
            basePath = path.join(cwd, basePath);
        }
        return new rgUtil_1.RgWalker({
            basePath: basePath,
            pattern: pat.pattern,
            ignorePattern: ignorePattern
        });
    }
    else {
        const pathMatcher = mmUtil_1.toPathMatcher(watch.pattern, {
            cwd: cwd,
            nameIgnorePattern: ignorePattern,
        });
        return new fsUtil_1.MyWalker(pathMatcher);
    }
}
class SimpleGlobWatcher {
    constructor(options, watch) {
        this.options = options;
        this.watch = watch;
        this._onChange = new vscode.EventEmitter();
        this.fileTick = () => __awaiter(this, void 0, void 0, function* () {
            if (this.lastFile) {
                try {
                    const newStat = yield fse.stat(this.lastFile.fullPath);
                    if (newStat.mtime.getTime() !== this.lastFile.stats.mtime.getTime()
                        || newStat.size !== this.lastFile.stats.size) {
                        this._onChange.fire({
                            filename: this.lastFile.fullPath,
                        });
                    }
                }
                catch (err) {
                    vscodeUtil_1.logger.error(err);
                    this.lastFile = undefined;
                    this._onChange.fire({
                        filename: undefined,
                    });
                }
            }
            this.fileTimer = setTimeout(this.fileTick, this.options.fileCheckInterval);
        });
        this.onError = (err) => {
            if (vscodeUtil_1.isDevEnv()) {
                vscodeUtil_1.logger.error(err);
            }
        };
        this.globTick = () => __awaiter(this, void 0, void 0, function* () {
            let maxMTime = 0;
            let maxFI;
            if (vscodeUtil_1.isDevEnv()) {
                vscodeUtil_1.logger.timeStart(this.watch.pattern);
            }
            yield this.walker.walk({
                onFile: (fi) => {
                    const mt = fi.stats.mtime.getTime();
                    if (mt > maxMTime) {
                        maxMTime = mt;
                        maxFI = fi;
                    }
                },
                onError: this.onError
            });
            if (vscodeUtil_1.isDevEnv()) {
                vscodeUtil_1.logger.timeEnd(this.watch.pattern);
            }
            if (maxFI) {
                let newLastFile = false;
                if (this.lastFile) {
                    if (maxFI.fullPath !== this.lastFile.fullPath) {
                        newLastFile = true;
                    }
                }
                else {
                    newLastFile = true;
                }
                if (newLastFile) {
                    this.lastFile = maxFI;
                    this._onChange.fire({
                        filename: maxFI.fullPath,
                    });
                }
            }
            else {
                if (this.lastFile) {
                    this.lastFile = undefined;
                    this._onChange.fire({
                        filename: undefined,
                    });
                }
            }
            this.globTimer = setTimeout(this.globTick, this.options.fileListInterval);
        });
        this.walker = getWalker(watch, this.options.ignorePattern);
    }
    get onChange() {
        return this._onChange.event;
    }
    LastFile() {
        if (this.lastFile) {
            return this.lastFile.fullPath;
        }
    }
    startWatch() {
        return __awaiter(this, void 0, void 0, function* () {
            this.fileTick();
            yield this.globTick();
        });
    }
    dispose() {
        if (this.fileTimer) {
            clearTimeout(this.fileTimer);
        }
        if (this.globTimer) {
            clearTimeout(this.globTimer);
        }
    }
}
exports.SimpleGlobWatcherConstructable = SimpleGlobWatcher;
//# sourceMappingURL=globWatcher.js.map