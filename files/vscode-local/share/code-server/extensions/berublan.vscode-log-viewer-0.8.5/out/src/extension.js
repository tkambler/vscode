"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const logProvider_1 = require("./logProvider");
const logExplorer = require("./logExplorer");
const statusBarItems = require("./statusBarItems");
const rgUtil_1 = require("./rgUtil");
const vscodeUtil_1 = require("./vscodeUtil");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // HACK
    const extDirName = path.basename(context.extensionPath);
    if (extDirName === "log-viewer" || extDirName === "vscode-log-viewer") {
        vscodeUtil_1.setDevEnv(true);
    }
    else {
        vscodeUtil_1.setDevEnv(false);
    }
    const logProvider = new logProvider_1.LogProvider();
    context.subscriptions.push(logProvider);
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("log", logProvider));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => {
        if (doc.uri.scheme === "log") {
            logProvider.unWatch(doc.uri);
        }
    }));
    statusBarItems.register(logProvider, context.subscriptions);
    logExplorer.register(logProvider, context.subscriptions);
    context.subscriptions.push(vscodeUtil_1.logger);
    if (vscodeUtil_1.isDevEnv()) {
        rgUtil_1.checkRgPath().then(found => {
            if (!found) {
                vscode.window.showWarningMessage("rg could not be found");
            }
            else {
                vscode.window.showInformationMessage("rg found");
            }
        });
    }
    if (vscodeUtil_1.isDevEnv()) {
        // logMock.start();
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map