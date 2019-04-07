"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getConfig(name) {
    const conf = vscode.workspace.getConfiguration("logViewer");
    return conf.get(name);
}
exports.getConfig = getConfig;
function getWatches() {
    const xs = getConfig("watch");
    if (!xs) {
        return [];
    }
    else {
        return xs.map((x, i) => {
            if (typeof x === "string") {
                return {
                    index: i,
                    pattern: x,
                    options: undefined,
                    title: undefined,
                    workspaceName: undefined
                };
            }
            else {
                return Object.assign({ index: i }, x);
            }
        });
    }
}
exports.getWatches = getWatches;
const defaulOptions = Object.freeze({
    fileCheckInterval: 500,
    fileListInterval: 2000,
    ignorePattern: "(node_modules|.git)",
    encoding: "utf8",
});
function getEffectiveWatchOptions(watchIndex) {
    // copy
    const resultOpts = Object.assign({}, defaulOptions);
    const watches = getWatches();
    const globalOpts = getConfig("options");
    if (globalOpts) {
        Object.assign(resultOpts, globalOpts);
    }
    const watchFromCfg = watches[watchIndex];
    if (watchFromCfg) {
        Object.assign(resultOpts, watchFromCfg.options);
    }
    return resultOpts;
}
exports.getEffectiveWatchOptions = getEffectiveWatchOptions;
//# sourceMappingURL=config.js.map