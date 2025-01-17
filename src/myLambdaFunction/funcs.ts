import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";
import { DynamoDBClient, GetItemCommand, GetItemCommandInput, ReturnValue, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { Field } from "./consts";

export type Callback<TResult> = (error?: Error | string | null, result?: TResult) => void;

export type APIGatewayHandler = (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => void | Promise<void>;

export const responseOk = (callback: Callback<APIGatewayProxyResult>, message: unknown): void => {
  callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(message),
    isBase64Encoded: false
  });
};

export const responseBadRequest = (callback: Callback<APIGatewayProxyResult>, message: unknown, statusCode = 400): void => {
  callback(null, {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(message),
    isBase64Encoded: false
  });
};

export const isRecord = (item: unknown): item is Record<string, unknown> => typeof item === 'object' && item !== null;

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });

export const loadFromDDB = async ({ TableName, Key }: { TableName: GetItemCommandInput['TableName'], Key: GetItemCommandInput['Key'] }) => ddbClient.send(new GetItemCommand({
  Key,
  TableName
}));

export const updateDDB = async ({ TableName, Key, diff }: { TableName: UpdateItemCommandInput['TableName'], Key: UpdateItemCommandInput['Key'], diff: number }) => ddbClient.send(new UpdateItemCommand({
  TableName,
  Key,
  ExpressionAttributeNames: { '#fn': Field },
  ExpressionAttributeValues: { ':fv': { N: diff.toString(10) } },
  UpdateExpression: 'ADD #fn :fv',
  ReturnValues: ReturnValue.ALL_NEW
})) 