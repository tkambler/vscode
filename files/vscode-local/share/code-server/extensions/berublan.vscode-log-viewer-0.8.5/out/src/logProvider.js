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
const fs = require("fs-extra");
const globWatcher_1 = require("./globWatcher");
const logUri_1 = require("./logUri");
const config_1 = require("./config");
const string_decoder_1 = require("string_decoder");
const vscodeUtil_1 = require("./vscodeUtil");
const ChunkSize = 64 * 1024;
let TheBuffer;
function lastChunk(file, decoder, offset) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!TheBuffer) {
            TheBuffer = new Buffer(2 * ChunkSize);
        }
        if (!offset || offset < 0) {
            offset = 0;
        }
        const fd = yield fs.open(file, "r");
        try {
            const stat = yield fs.stat(file);
            const partSize = stat.size - offset;
            if (partSize <= 0) {
                return "";
            }
            let res;
            if (partSize > ChunkSize) {
                const lastChunkSize = partSize % ChunkSize;
                const readSize = ChunkSize + lastChunkSize;
                res = yield fs.read(fd, TheBuffer, 0, readSize, stat.size - lastChunkSize);
            }
            else {
                res = yield fs.read(fd, TheBuffer, 0, partSize, offset);
            }
            const buff = res.buffer.slice(0, res.bytesRead);
            const text = decoder.write(buff);
            return text;
        }
        finally {
            yield fs.close(fd);
        }
    });
}
const _decoders = {};
function getDecoder(encoding) {
    let decoder = _decoders[encoding];
    if (decoder) {
        // clear internal buffer
        decoder.end();
        return decoder;
    }
    try {
        decoder = new string_decoder_1.StringDecoder(encoding);
        _decoders[encoding] = decoder;
        return decoder;
    }
    catch (error) {
        vscodeUtil_1.logger.error(error);
        return getDecoder("utf8");
    }
}
class LogProvider {
    constructor() {
        this._onContentProviderDidChange = new vscode.EventEmitter();
        this._onChange = new vscode.EventEmitter();
        this._watchedUris = new Map();
    }
    has(uri) {
        return this._watchedUris.has(uri.toString());
    }
    get(uri) {
        const uriStr = uri.toString();
        const state = this._watchedUris.get(uriStr);
        if (!state) {
            return;
        }
        return {
            uri: uri,
            lastChangedOn: state.lastChangedOn,
            lastFileName: state.lastFileName,
            text: state.text,
        };
    }
    clearContents(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = this._watchedUris.get(uri.toString());
            if (state && state.lastFileName) {
                const stat = yield fs.stat(state.lastFileName);
                state.offset = stat.size;
                yield this.checkChange(uri, state, state.lastFileName);
            }
        });
    }
    restoreContents(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = this._watchedUris.get(uri.toString());
            if (state && state.lastFileName) {
                state.offset = undefined;
                yield this.checkChange(uri, state, state.lastFileName);
            }
        });
    }
    reload(uri) {
        this._onContentProviderDidChange.fire(uri);
    }
    watchUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const uriStr = uri.toString();
            const foundState = this._watchedUris.get(uriStr);
            if (foundState) {
                return foundState;
            }
            const w = logUri_1.fromLogUri(uri);
            const options = config_1.getEffectiveWatchOptions(w.index);
            const newState = {
                watcher: new globWatcher_1.SimpleGlobWatcherConstructable(options, w),
                decoder: getDecoder(options.encoding),
                lastChangedOn: new Date(),
                lastFileName: undefined,
                offset: undefined,
                text: undefined,
            };
            newState.watcher.onChange(e => {
                this.checkChange(uri, newState, e.filename);
            });
            this._watchedUris.set(uriStr, newState);
            yield newState.watcher.startWatch();
            // without this provideTextDocumentContent doesn't get text the first time
            yield this.checkChange(uri, newState, newState.watcher.LastFile());
            return newState;
        });
    }
    checkChange(uri, state, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if filename changed
            let didChange = false;
            if (state.lastFileName !== filename) {
                state.lastFileName = filename;
                state.offset = undefined;
                didChange = true;
            }
            // check if content changed
            let text;
            if (filename) {
                text = yield lastChunk(filename, state.decoder, state.offset);
            }
            else {
                text = undefined;
            }
            if (state.text !== text) {
                state.text = text;
                state.lastChangedOn = new Date();
                didChange = true;
            }
            // should this also fire only if content changed?
            this._onContentProviderDidChange.fire(uri);
            if (didChange) {
                this._onChange.fire({
                    uri: uri,
                    lastChangedOn: state.lastChangedOn,
                    lastFileName: state.lastFileName,
                    text: state.text,
                });
            }
        });
    }
    get onDidChange() {
        return this._onContentProviderDidChange.event;
    }
    get onChange() {
        return this._onChange.event;
    }
    provideTextDocumentContent(uri, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield this.watchUri(uri);
            if (typeof state.text !== "undefined") {
                return state.text || "\n"; // with empty string vscode keeps the previous text
            }
            else {
                return "no matching file found";
            }
        });
    }
    unWatch(uri) {
        const uriStr = uri.toString();
        const state = this._watchedUris.get(uriStr);
        if (state) {
            state.watcher.dispose();
            this._watchedUris.delete(uriStr);
        }
    }
    unWatchAll() {
        for (const state of this._watchedUris.values()) {
            state.watcher.dispose();
        }
        this._watchedUris.clear();
    }
    dispose() {
        this.unWatchAll();
        this._onContentProviderDidChange.dispose();
    }
}
exports.LogProvider = LogProvider;
//# sourceMappingURL=logProvider.js.map