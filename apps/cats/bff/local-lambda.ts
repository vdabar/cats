import * as dotenv from 'dotenv';
import AWS from 'aws-sdk';
dotenv.config({ path: `${__dirname}/.env`.replace('/dist', '') });
AWS.config.update({
  region: 'local',
  endpoint: 'http://localhost:8000',
});
const dynamodb = new AWS.DynamoDB();
const params = {
  TableName: 'cats-table',
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'NameIndex',
      KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'name', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};
import express from 'express';
import { handler } from './src/main';
import bodyParser from 'body-parser';
dynamodb.createTable(params, function (err, data) {
  if (err) {
    console.error('Error JSON.', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table.', JSON.stringify(data, null, 2));
  }
});
const port = 3000;
const app = express();
app.use(bodyParser.json());
app.all('/*', async (req, res) => {
  const response = await handler({
    queryStringParameters: req.query,
    resource: req.path.includes('/api/cats/') ? '/api/cats/{id}' : req.path,
    httpMethod: req.method,
    body: JSON.stringify(req.body),
    pathParameters: req.path.includes('/api/cats/')
      ? { id: req.path.split('/').pop() }
      : undefined,
  });
  res.status(response.statusCode);
  res.send(JSON.parse(response.body));
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
