"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const perf_hooks_1 = require("perf_hooks");
// export const MaxRange = new vscode.Range(
//     new vscode.Position(0, 0),
//     new vscode.Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
// );
function toStr(x) {
    if (typeof x === "string") {
        return x;
    }
    else if (typeof x.toString === "function") {
        return x.toString();
    }
    else {
        return JSON.stringify(x, undefined, "\t");
    }
}
function getWorkspaceDir(workspaceName) {
    if (vscode.workspace.workspaceFolders
        && vscode.workspace.workspaceFolders.length) {
        let workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (workspaceName) {
            const wf = vscode.workspace.workspaceFolders.find(x => x.name === workspaceName);
            if (wf) {
                workspaceFolder = wf;
            }
        }
        if (workspaceFolder) {
            return workspaceFolder.uri.fsPath;
        }
    }
}
exports.getWorkspaceDir = getWorkspaceDir;
function mapEvent(event, func) {
    return (listener, thisArgs, disposables) => {
        return event(x => listener(func(x)), thisArgs, disposables);
    };
}
exports.mapEvent = mapEvent;
class Logger {
    constructor() {
        this._times = {};
    }
    log(level, x) {
        if (!this._outputChannel) {
            this._outputChannel = vscode.window.createOutputChannel("log-viewer");
            this._outputChannel.show();
        }
        const str = level + " " + toStr(x);
        this._outputChannel.appendLine(str);
    }
    error(x) {
        this.log("[ERROR]", x);
    }
    debug(x) {
        if (isDevEnv()) {
            this.log("[DEBUG]", x);
        }
    }
    timeStart(label) {
        this._times[label] = perf_hooks_1.performance.now();
    }
    timeEnd(label) {
        const t0 = this._times[label];
        if (t0) {
            const t1 = perf_hooks_1.performance.now();
            delete this._times[label];
            const ms = (t1 - t0).toFixed(2);
            this.debug(`${label} ${ms} ms`);
        }
    }
    dispose() {
        if (this._outputChannel) {
            this._outputChannel.dispose();
        }
    }
}
exports.logger = new Logger();
let _devEnv = false;
function setDevEnv(val) {
    _devEnv = val;
}
exports.setDevEnv = setDevEnv;
function isDevEnv() {
    return _devEnv;
}
exports.isDevEnv = isDevEnv;
//# sourceMappingURL=vscodeUtil.js.map