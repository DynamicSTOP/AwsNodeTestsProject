"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const funcs_1 = require("./funcs");
const consts_1 = require("./consts");
const update = (_a) => __awaiter(void 0, [_a], void 0, function* ({ callback, diff }) {
    const { Attributes } = yield (0, funcs_1.updateDDB)({ TableName: consts_1.TableName, Key: consts_1.Key, diff });
    if (Attributes === undefined) {
        throw new TypeError('bad attributes');
    }
    const updated = Attributes[consts_1.Field].N;
    if (updated === undefined) {
        throw new TypeError('no updated field in ddb response');
    }
    const updatedNumber = Number.parseInt(updated, 10);
    if (Number.isNaN(updatedNumber)) {
        throw new TypeError('no updated field in ddb response');
    }
    (0, funcs_1.responseOk)(callback, updatedNumber);
});
const addOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ callback }) { return update({ callback, diff: 1 }); });
const subtractOne = (_a) => __awaiter(void 0, [_a], void 0, function* ({ callback }) { return update({ callback, diff: 1 }); });
const getFromDDB = (_a) => __awaiter(void 0, [_a], void 0, function* ({ callback }) {
    const { Item } = yield (0, funcs_1.loadFromDDB)({ Key: consts_1.Key, TableName: consts_1.TableName });
    if (Item === undefined) {
        throw new TypeError('no item');
    }
    const numStr = Item[consts_1.Field].N;
    if (numStr === undefined) {
        throw new TypeError('no updated field in ddb response');
    }
    const num = Number.parseInt(numStr, 10);
    if (Number.isNaN(num)) {
        throw new TypeError('no updated field in ddb response');
    }
    (0, funcs_1.responseOk)(callback, num);
});
const handleRequest = (_a) => __awaiter(void 0, [_a], void 0, function* ({ request, callback }) {
    const { action } = request;
    switch (action) {
        case 'plus':
            yield addOne({ callback });
            break;
        case 'minus':
            yield subtractOne({ callback });
            break;
        case 'get':
            yield getFromDDB({ callback });
            break;
        default: throw new TypeError('unknown action');
    }
});
const handler = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = event;
    if (typeof body !== 'string') {
        callback('error');
        throw new TypeError('empty body');
    }
    let request = {};
    try {
        const raw = JSON.parse(body);
        if (!(0, funcs_1.isRecord)(raw)) {
            callback('error');
            throw new TypeError('bad request body');
        }
        request = raw;
    }
    catch (error) {
        callback('error');
        throw new TypeError('failed to parse');
    }
    try {
        yield handleRequest({ request, callback });
    }
    catch (error) {
        callback('error');
        throw new TypeError('erorr while processing request');
    }
});
exports.handler = handler;
