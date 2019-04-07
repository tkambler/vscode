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
const fs = require("fs-extra");
const pth = require("path");
const util_1 = require("./util");
const vscodeUtil_1 = require("./vscodeUtil");
const fsUtil_1 = require("./fsUtil");
const src = "/home/berni/Documentos/src/log-viewer/sample-logs/";
const dest = "/home/berni/Documentos/src/test/sample-logs/the-logs/";
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.remove(dest);
        yield fs.mkdirp(dest);
        const files = [];
        yield fsUtil_1.lsRec(src, f => {
            if (!/\/iis\//.test(f.fullPath)) {
                files.push(f);
            }
        });
        fileIt(files);
    });
}
exports.start = start;
function fileIt(fis) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const fi of fis) {
            const destFile = pth.join(dest, pth.basename(fi.fullPath));
            const dstFd = yield fs.open(destFile, "w");
            const srcFd = yield fs.open(fi.fullPath, "r");
            const srcSize = fi.stats.size;
            chunksIt(srcFd, srcSize, dstFd);
            yield util_1.delay(5000 + 5000 * Math.random());
        }
    });
}
const buff = new Buffer(128);
function chunksIt(srcFd, srcSize, destFd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let offset = 0;
            while (offset < srcSize) {
                const res = yield fs.read(srcFd, buff, 0, buff.length, offset);
                const wres = yield fs.write(destFd, buff, 0, "utf8");
                offset += buff.length;
                yield util_1.delay(500 + 500 * Math.random());
            }
        }
        catch (error) {
            vscodeUtil_1.logger.error(error);
        }
        finally {
            yield fs.close(srcFd);
            yield fs.close(destFd);
        }
    });
}
//# sourceMappingURL=logMock.js.map