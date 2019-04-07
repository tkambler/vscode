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
const path = require("path");
const logExplorer_1 = require("./logExplorer");
const config_1 = require("./config");
const logUri_1 = require("./logUri");
const toggleFollowTailCmd = "logviewer.toggleFollowTail";
const clearCmd = "logviewer.clearLogView";
const resetCmd = "logviewer.resetLogView";
const openCurrentFileCmd = "logviewer.openCurrentFile";
const openLastChangedCmd = "logviewer.openLastChanged";
let _statusBarItemPriority = 0;
function simpleStatusBarComponent(subs, props) {
    const item = vscode.window.createStatusBarItem(undefined, _statusBarItemPriority++);
    subs.push(item);
    item.text = props.text;
    if (props.tooltip) {
        item.tooltip = props.tooltip;
    }
    if (props.command) {
        item.command = props.command.name;
        subs.push(vscode.commands.registerCommand(props.command.name, props.command.action));
    }
    return item;
}
function shouldHandle(editor) {
    if (!editor) {
        return false;
    }
    return editor.document.uri.scheme === "log";
}
class FollowTailStatusBarComponent {
    constructor(subs) {
        this.followTail = true;
        this.onDidChangeTextEditorVisibleRanges = (e) => {
            if (!shouldHandle(e.textEditor)) {
                return;
            }
            if (!e.visibleRanges.length) {
                return;
            }
            const lastLine = e.visibleRanges[e.visibleRanges.length - 1].end.line;
            const lastDocLine = e.textEditor.document.lineCount - 1;
            if (lastLine < lastDocLine) {
                this.setFollowTail(false, e.textEditor);
            }
            else {
                this.setFollowTail(true, e.textEditor);
            }
        };
        this.onDidChangeTextDocument = (e) => {
            if (!this.followTail) {
                return;
            }
            const editor = vscode.window.activeTextEditor;
            if (!shouldHandle(editor) || editor.document !== e.document) {
                return;
            }
            if (editor.selection.isEmpty) {
                // hack that prevents text inserted at the end from being selected
                // when the cursor position is at the end of the document
                editor.selection = editor.selection;
            }
            this.jumpToTail(editor);
        };
        this.item = simpleStatusBarComponent(subs, {
            text: "",
            command: {
                name: toggleFollowTailCmd,
                action: () => {
                    const editor = vscode.window.activeTextEditor;
                    if (shouldHandle(editor)) {
                        this.setFollowTail(!this.followTail, editor);
                    }
                },
            },
        });
        subs.push(vscode.window.onDidChangeTextEditorVisibleRanges(this.onDidChangeTextEditorVisibleRanges));
        subs.push(vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument));
    }
    show() {
        this.item.show();
        const editor = vscode.window.activeTextEditor;
        if (shouldHandle(editor)) {
            this.refresh(editor);
        }
    }
    hide() {
        this.item.hide();
    }
    refresh(editor) {
        this.item.text = this.followTail ? "$(flame) Don't Follow Tail" : "$(pulse) Follow Tail";
        if (this.followTail) {
            this.jumpToTail(editor);
        }
    }
    setFollowTail(value, editor) {
        if (value === this.followTail) {
            return;
        }
        this.followTail = value;
        this.refresh(editor);
    }
    jumpToTail(editor) {
        const lastLineRange = editor.document.lineAt(editor.document.lineCount - 1).range;
        editor.revealRange(lastLineRange);
    }
}
// this item is not contextual to the activeTextEditor
// it's shown whenever a watch changes in the background (if the config is enabled)
class LastChangedStatusBarItem {
    constructor(subs) {
        this.onDidChangeActiveTextEditor = (editor) => {
            if (!this.lastState) {
                return;
            }
            if (editor && editor.document.uri.toString() === this.lastState.uri.toString()) {
                this.clear();
            }
        };
        this.onInterval = () => {
            if (!this.lastState) {
                return;
            }
            const secs = Math.round((Date.now() - this.lastState.lastChangedOn.getTime()) / 1000);
            let timeStr;
            if (secs >= 60) {
                const mins = Math.floor(secs / 60);
                timeStr = `${mins}min`;
            }
            else {
                timeStr = `${secs}s`;
            }
            this.item.tooltip = `changed ${timeStr} ago`;
        };
        this.item = simpleStatusBarComponent(subs, {
            text: "",
            command: {
                name: openLastChangedCmd,
                action: () => {
                    if (this.lastState) {
                        vscode.commands.executeCommand(logExplorer_1.openLogResourceCmd, [this.lastState.uri.toString()]);
                    }
                    this.clear();
                },
            },
        });
        subs.push(vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor));
    }
    clear() {
        this.lastState = undefined;
        this.item.hide();
        this.item.text = "";
        this.clearInterval();
    }
    clearInterval() {
        this.item.tooltip = "";
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = undefined;
        }
    }
    setLastChanged(state) {
        if (config_1.getConfig("showStatusBarItemOnChange")) {
            this.lastState = state;
            if (!this.intervalHandle) {
                this.intervalHandle = setInterval(this.onInterval, 1000);
            }
            else {
                this.onInterval();
            }
            const w = logUri_1.fromLogUri(state.uri);
            const title = w.title || w.pattern;
            this.item.text = `$(bell) Changes in: ${title}`;
            this.item.show();
        }
        else {
            this.clear();
        }
    }
}
//icons in https://octicons.github.com/
function register(logProvider, subs) {
    // last changed watch
    const lastChangeItem = new LastChangedStatusBarItem(subs);
    // watch info
    function setWatchingInfo(state) {
        if (state && state.lastFileName) {
            watchingInfoItem.text = "$(file-text) " + path.basename(state.lastFileName);
            watchingInfoItem.tooltip = state.lastFileName;
        }
        else {
            watchingInfoItem.text = "";
            watchingInfoItem.tooltip = "";
        }
    }
    const watchingInfoItem = simpleStatusBarComponent(subs, {
        text: "",
        tooltip: "",
        command: {
            name: openCurrentFileCmd,
            action: () => __awaiter(this, void 0, void 0, function* () {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    return;
                }
                const logUri = activeEditor.document.uri;
                if (logUri.scheme !== "log") {
                    return;
                }
                const state = logProvider.get(logUri);
                if (state && state.lastFileName) {
                    const doc = yield vscode.workspace.openTextDocument(state.lastFileName);
                    const _ = yield vscode.window.showTextDocument(doc);
                }
            })
        }
    });
    //follow tail
    const followTailComponent = new FollowTailStatusBarComponent(subs);
    //reset
    const resetItem = simpleStatusBarComponent(subs, {
        text: "$(history) Reset",
        command: {
            name: resetCmd,
            action: () => __awaiter(this, void 0, void 0, function* () {
                if (vscode.window.activeTextEditor) {
                    const uri = vscode.window.activeTextEditor.document.uri;
                    logProvider.restoreContents(uri);
                }
            })
        }
    });
    //clear
    const clearItem = simpleStatusBarComponent(subs, {
        text: "$(x) Clear",
        command: {
            name: clearCmd,
            action: () => __awaiter(this, void 0, void 0, function* () {
                if (vscode.window.activeTextEditor) {
                    const uri = vscode.window.activeTextEditor.document.uri;
                    logProvider.clearContents(uri);
                }
            })
        }
    });
    // common
    // log file contextual items
    const statusBarItems = [followTailComponent, clearItem, resetItem, watchingInfoItem];
    function checkShow(editor) {
        if (shouldHandle(editor)) {
            for (const item of statusBarItems) {
                item.show();
            }
            setWatchingInfo(logProvider.get(editor.document.uri));
        }
        else {
            for (const item of statusBarItems) {
                item.hide();
            }
        }
    }
    checkShow(vscode.window.activeTextEditor);
    subs.push(vscode.window.onDidChangeActiveTextEditor(checkShow));
    subs.push(logProvider.onChange(change => {
        const editor = vscode.window.activeTextEditor;
        // implies shouldHandle == true because change uri should only be a "log://..." uri
        if (editor && editor.document.uri.toString() === change.uri.toString()) {
            setWatchingInfo(change);
        }
        else {
            lastChangeItem.setLastChanged(change);
        }
    }));
}
exports.register = register;
//# sourceMappingURL=statusBarItems.js.map