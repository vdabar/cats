import { Cat } from '@cats/cats/types';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import config from './config';

export async function getAllCats(): Promise<Cat[]> {
  const client = new DynamoDB({ region: 'eu-west-1' });
  const params = { TableName: config.CATS_DYNAMO_TABLE };
  const result = await client.scan(params);
  return result.Items?.map((item) => unmarshall(item)) as unknown as Cat[];
}

export async function addCat(cat: Cat) {
  const client = new DynamoDB({ region: 'eu-west-1' });
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Item: marshall(cat),
    ReturnConsumedCapacity: 'TOTAL',
  };
  return client.putItem(params);
}

export function deleteCat(id: string) {
  const client = new DynamoDB({ region: 'eu-west-1' });
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Key: marshall({ id }),
  };
  return client.deleteItem(params);
}

export async function getCatById(id: string): Promise<Cat> {
  const client = new DynamoDB({ region: 'eu-west-1' });
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Key: marshall({ id }),
  };
  const result = await client.getItem(params);
  return result.Item ? (unmarshall(result.Item) as unknown as Cat) : undefined;
}

export async function getCatsByName(name: string): Promise<Cat[]> {
  const client = new DynamoDB({ region: 'eu-west-1' });
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    IndexName: 'NameIndex',
    KeyConditionExpression: '#name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: marshall({ ':name': name }),
  };
  const result = await client.query(params);
  return result.Items?.map((item) => unmarshall(item)) as unknown as Cat[];
}
