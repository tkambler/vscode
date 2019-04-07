"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
function toLogUri(w) {
    //the only way I found to control the title of the tab is with the path of the uri
    //so if we have a title use it as the path of the uri
    let tabTitle = w.title || w.pattern;
    //add extension so that is asociated with appropiate syntax highlighting
    const ext = path.extname(w.pattern);
    if (ext && ext !== "." && ext.indexOf("*") === -1) {
        if (!tabTitle.endsWith(ext)) {
            tabTitle = tabTitle + ext;
        }
    }
    else {
        // with .log-viewer it will pick our log highlighting
        tabTitle = tabTitle + ".log-viewer";
    }
    //"logviewer" will become the authority part
    const json = JSON.stringify(w);
    const uriStr = `log://logviewer/${encodeURIComponent(tabTitle)}?${encodeURIComponent(json)}`;
    return vscode.Uri.parse(uriStr);
}
exports.toLogUri = toLogUri;
function fromLogUri(logUri) {
    const w = JSON.parse(logUri.query);
    return w;
}
exports.fromLogUri = fromLogUri;
//# sourceMappingURL=logUri.js.map