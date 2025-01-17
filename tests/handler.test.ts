import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { expect, test } from '@jest/globals';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from "../src/myLambdaFunction";
import { Field } from '../src/myLambdaFunction/consts';
import { isRecord } from "../src/myLambdaFunction/funcs";

const dynamoDBMock = mockClient(DynamoDBClient);

dynamoDBMock.on(GetItemCommand).resolves({
  Item: { [Field]: { N: '5' } },
}).on(UpdateItemCommand).resolves({
  Attributes: { [Field]: { N: '2' } }
});

const makeCallback = () => {
  let result: { data: unknown, err: unknown } = { data: null, err: null }
  const callback = (err: unknown, data: unknown) => {
    if (err !== null) {
      result.err = err;
    }
    result.data = data;
  }
  return { result, callback };
}

test('empty request fail', () => {
  expect(async () => {
    const { callback } = makeCallback();
    await handler({} as unknown as APIGatewayProxyEvent, {} as unknown as Context, callback);
  }).rejects.toThrow();
});

test('get request', async () => {
  const { result, callback } = makeCallback();
  await handler({ body: JSON.stringify({ action: 'get' }) } as unknown as APIGatewayProxyEvent, {} as unknown as Context, callback);
  const { data } = result;
  expect(isRecord(data) ? data.body : undefined).toEqual("5");
})

test('update command', async () => {
  const { result, callback } = makeCallback();
  await handler({ body: JSON.stringify({ action: 'plus' }) } as unknown as APIGatewayProxyEvent, {} as unknown as Context, callback);
  const { data } = result;
  expect(isRecord(data) ? data.body : undefined).toEqual("2");
})