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
const config = require("./config");
const logUri_1 = require("./logUri");
const path = require("path");
exports.openLogResourceCmd = "logviewer.openLogResource";
const unwatchCmd = "logviewer.unwatchLogResource";
const unwatchAllCmd = "logviewer.unwatchAll";
const eyeIconPath = {
    light: path.join(__dirname, "..", "..", "images", "light", "baseline-visibility-24px.svg"),
    dark: path.join(__dirname, "..", "..", "images", "dark", "baseline-visibility-24px.svg"),
};
class LogExplorer {
    constructor(logProvider) {
        this.logProvider = logProvider;
        this._onDidChange = new vscode.EventEmitter();
        this.disposable = vscode.Disposable.from(this._onDidChange, vscode.workspace.onDidChangeConfiguration(() => {
            this.logProvider.unWatchAll(); // ???
            this._onDidChange.fire();
        }));
    }
    get onDidChangeTreeData() {
        return this._onDidChange.event;
    }
    reload() {
        this._onDidChange.fire();
    }
    getTreeItem(element) {
        const watching = this.logProvider.has(element.uri);
        const name = element.title || element.pattern;
        const item = new vscode.TreeItem(name);
        if (watching) {
            item.iconPath = eyeIconPath;
            item.contextValue = "watching";
        }
        else {
            item.iconPath = undefined; //vscode.ThemeIcon.File;
            item.contextValue = undefined;
        }
        item.command = {
            command: exports.openLogResourceCmd,
            arguments: [element.uri.toString()],
            title: name,
            tooltip: name
        };
        return item;
    }
    getChildren(element) {
        if (element === undefined) {
            const watches = config.getWatches();
            return watches.map(w => {
                const res = {
                    title: w.title,
                    pattern: w.pattern,
                    uri: logUri_1.toLogUri(w),
                };
                return res;
            });
        }
    }
    dispose() {
        this.disposable.dispose();
    }
}
LogExplorer.ViewId = "logExplorer";
function register(logProvider, subs) {
    const logExplorer = new LogExplorer(logProvider);
    subs.push(logExplorer);
    subs.push(vscode.window.registerTreeDataProvider(LogExplorer.ViewId, logExplorer));
    subs.push(vscode.commands.registerCommand(exports.openLogResourceCmd, (logUri) => __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.parse(logUri);
        logProvider.reload(uri);
        const doc = yield vscode.workspace.openTextDocument(uri);
        logExplorer.reload();
        const _ = yield vscode.window.showTextDocument(doc, { preview: false });
    })));
    subs.push(vscode.commands.registerCommand(unwatchCmd, (x) => {
        let uri;
        if (typeof x === "string") {
            uri = vscode.Uri.parse(x);
        }
        else if (x.uri instanceof vscode.Uri) {
            uri = x.uri;
        }
        else {
            return;
        }
        logProvider.unWatch(uri);
        logExplorer.reload();
    }));
    subs.push(vscode.commands.registerCommand(unwatchAllCmd, () => {
        logProvider.unWatchAll();
        logExplorer.reload();
    }));
}
exports.register = register;
//# sourceMappingURL=logExplorer.js.map