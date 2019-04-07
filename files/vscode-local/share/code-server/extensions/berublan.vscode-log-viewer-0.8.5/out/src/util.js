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
function assertNever(x) {
    throw new Error(`${x} is not never`);
}
exports.assertNever = assertNever;
function keys(x) {
    const res = {};
    for (const k of Object.keys(x)) {
        res[k] = k;
    }
    return res;
}
exports.keys = keys;
function delay(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res) => {
            setTimeout(res, ms);
        });
    });
}
exports.delay = delay;
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this._reject = reject;
            this._resolve = resolve;
        });
    }
    get resolve() {
        return this._resolve;
    }
    get reject() {
        return this._reject;
    }
}
exports.Deferred = Deferred;
//# sourceMappingURL=util.js.map