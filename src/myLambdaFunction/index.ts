import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";
import { Field, Key, TableName } from "./consts";
import { APIGatewayHandler, Callback, isRecord, loadFromDDB, responseOk, updateDDB } from "./funcs";

const update = async ({ callback, diff }: { diff: number, callback: Callback<APIGatewayProxyResult> }) => {
  const { Attributes } = await updateDDB({ TableName, Key, diff })
  if (Attributes === undefined) {
    throw new TypeError('bad attributes');
  }

  const updated = Attributes[Field].N;
  if (updated === undefined) {
    throw new TypeError('no updated field in ddb response');
  }

  const updatedNumber = Number.parseInt(updated, 10);
  if (Number.isNaN(updatedNumber)) {
    throw new TypeError('no updated field in ddb response');
  }

  responseOk(callback, updatedNumber);
}


const addOne = async ({ callback }: { callback: Callback<APIGatewayProxyResult> }) => update({ callback, diff: 1 })
const subtractOne = async ({ callback }: { callback: Callback<APIGatewayProxyResult> }) => update({ callback, diff: 1 })

const getFromDDB = async ({ callback }: { callback: Callback<APIGatewayProxyResult> }) => {
  const { Item } = await loadFromDDB({ Key, TableName });
  if (Item === undefined) {
    throw new TypeError('no item');
  }

  const numStr = Item[Field].N;
  if (numStr === undefined) {
    throw new TypeError('no updated field in ddb response');
  }

  const num = Number.parseInt(numStr, 10);
  if (Number.isNaN(num)) {
    throw new TypeError('no updated field in ddb response');
  }
  responseOk(callback, num);
}

const handleRequest = async ({ request, callback }: { request: Record<string, unknown>, callback: Callback<APIGatewayProxyResult> }) => {
  const { action } = request;
  switch (action) {
    case 'plus': await addOne({ callback }); break;
    case 'minus': await subtractOne({ callback }); break;
    case 'get': await getFromDDB({ callback }); break;
    default: throw new TypeError('unknown action');
  }
}

export const handler: APIGatewayHandler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) => {
  const { body } = event;

  if (typeof body !== 'string') {
    callback('error');
    throw new TypeError('empty body');
  }

  let request: Record<string, unknown> = {};

  try {
    const raw: unknown = JSON.parse(body);
    if (!isRecord(raw)) {
      callback('error');
      throw new TypeError('bad request body')
    }
    request = raw;
  } catch (error: unknown) {
    callback('error');
    throw new TypeError('failed to parse');
  }

  try {
    await handleRequest({ request, callback });
  } catch (error: unknown) {
    callback('error');
    throw error;
  }
} 