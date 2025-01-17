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
exports.updateDDB = exports.loadFromDDB = exports.isRecord = exports.responseBadRequest = exports.responseOk = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const consts_1 = require("./consts");
const responseOk = (callback, message) => {
    callback(null, {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(message),
        isBase64Encoded: false
    });
};
exports.responseOk = responseOk;
const responseBadRequest = (callback, message, statusCode = 400) => {
    callback(null, {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(message),
        isBase64Encoded: false
    });
};
exports.responseBadRequest = responseBadRequest;
const isRecord = (item) => typeof item === 'object' && item !== null;
exports.isRecord = isRecord;
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-1' });
const loadFromDDB = (_a) => __awaiter(void 0, [_a], void 0, function* ({ TableName, Key }) {
    return ddbClient.send(new client_dynamodb_1.GetItemCommand({
        Key,
        TableName
    }));
});
exports.loadFromDDB = loadFromDDB;
const updateDDB = (_a) => __awaiter(void 0, [_a], void 0, function* ({ TableName, Key, diff }) {
    return ddbClient.send(new client_dynamodb_1.UpdateItemCommand({
        TableName,
        Key,
        ExpressionAttributeNames: { '#fn': consts_1.Field },
        ExpressionAttributeValues: { ':fv': { N: diff.toString(10) } },
        UpdateExpression: 'ADD #fn :fv',
        ReturnValues: client_dynamodb_1.ReturnValue.ALL_NEW
    }));
});
exports.updateDDB = updateDDB;
