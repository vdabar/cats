import { GetCatResponseDto, AddCatDto } from '@cats/cats/types';
import { DynamoDB } from 'aws-sdk';
import config from './config';

export async function getAllCats(): Promise<GetCatResponseDto[]> {
  const client = new DynamoDB.DocumentClient();
  const params = { TableName: config.CATS_DYNAMO_TABLE };
  const result = await client.scan(params).promise();
  return result.Items as GetCatResponseDto[];
}

export async function addCat(cat: AddCatDto) {
  const client = new DynamoDB.DocumentClient();
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Item: cat,
    ReturnConsumedCapacity: 'TOTAL',
  };
  return client.put(params).promise();
}

export function deleteCat(id: string) {
  const client = new DynamoDB.DocumentClient();
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Key: { id },
  };
  return client.delete(params).promise();
}

export async function getCatById(id: string): Promise<GetCatResponseDto> {
  const client = new DynamoDB.DocumentClient();
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    Key: { id },
  };
  const result = await client.get(params).promise();
  return result.Item as GetCatResponseDto;
}

export async function getCatsByName(
  name: string
): Promise<GetCatResponseDto[]> {
  const client = new DynamoDB.DocumentClient();
  const params = {
    TableName: config.CATS_DYNAMO_TABLE,
    IndexName: 'NameIndex',
    KeyConditionExpression: '#name = :name',
    ExpressionAttributeNames: { '#name': 'name' },
    ExpressionAttributeValues: { ':name': name },
  };
  const result = await client.query(params).promise();
  return result.Items as GetCatResponseDto[];
}
