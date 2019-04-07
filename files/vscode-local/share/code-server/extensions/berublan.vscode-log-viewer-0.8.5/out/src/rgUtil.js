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
const fsUtil_1 = require("./fsUtil");
const child_process_1 = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const vscodeUtil_1 = require("./vscodeUtil");
const config_1 = require("./config");
let _rgPath;
function checkRgPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const rgPaths = [
            "node_modules.asar.unpacked/vscode-ripgrep/bin/rg",
            "extensions/search-rg/node_modules/vscode-ripgrep/bin/rg"
        ];
        const configRgPath = config_1.getConfig("ripgrepPath");
        if (configRgPath) {
            rgPaths.push(configRgPath);
        }
        for (const rgRelPath of rgPaths) {
            const rgPath = path.join(vscode.env.appRoot, rgRelPath);
            const exists = yield fs.pathExists(rgPath);
            if (exists) {
                _rgPath = rgPath;
                return true;
            }
        }
        // fallback
        let res = false;
        yield fsUtil_1.lsRec(vscode.env.appRoot, f => {
            const name = path.basename(f.fullPath);
            if (name === "rg" || name === "rg.exe") {
                _rgPath = f.fullPath;
                res = true;
            }
        });
        return res;
    });
}
exports.checkRgPath = checkRgPath;
function rgPathFound() {
    return typeof _rgPath === "string";
}
exports.rgPathFound = rgPathFound;
function rg(rgPath, opts, onLine, onError) {
    return new Promise((res, rej) => {
        const args = [
            "--files",
            "--no-ignore",
            "--hidden",
        ];
        // TODO check if making this optional works
        if (opts.pattern) {
            args.push("--glob");
            args.push(opts.pattern);
        }
        if (opts.ignorePattern) {
            args.push("--glob");
            args.push("!" + opts.ignorePattern);
        }
        const proc = child_process_1.spawn(rgPath, args, { cwd: opts.basePath });
        proc.on("error", e => {
            onError(e);
        });
        proc.stdout.on("data", (x) => {
            const lines = x.toString().split(/\r?\n/);
            for (const line of lines) {
                if (line) {
                    onLine(line);
                }
            }
        });
        proc.stderr.on("data", (x) => {
            // ignore??
            if (vscodeUtil_1.isDevEnv()) {
                const errMsg = x.toString().trim();
                vscodeUtil_1.logger.error(errMsg);
            }
        });
        proc.on("exit", () => {
            res();
        });
    });
}
function rgInfos(rgPath, opts, sub) {
    return new Promise((res) => {
        let pending = 1;
        function checkResolve() {
            if (pending === 0) {
                res();
            }
        }
        rg(rgPath, opts, (line) => {
            const fullPath = path.join(opts.basePath, line);
            pending += 1;
            fs.stat(fullPath, (err, stat) => {
                pending -= 1;
                if (err) {
                    sub.onError(err);
                }
                else {
                    sub.onFile({
                        fullPath: fullPath,
                        stats: stat
                    });
                }
                checkResolve();
            });
        }, sub.onError).then(() => {
            pending -= 1;
            checkResolve();
        }).catch(err => {
            pending -= 1;
            sub.onError(err);
            checkResolve();
        });
    });
}
class RgWalker {
    constructor(opts) {
        this.opts = opts;
        if (!_rgPath) {
            throw new Error("Couldn't find rg");
        }
        else {
            this.rgPath = _rgPath;
        }
        const options = this.opts;
        options.pattern = options.pattern;
    }
    walk(sub) {
        return rgInfos(this.rgPath, this.opts, sub);
    }
}
exports.RgWalker = RgWalker;
//# sourceMappingURL=rgUtil.js.map