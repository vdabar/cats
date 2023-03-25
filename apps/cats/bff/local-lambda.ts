import express from 'express';
import { handler } from './src/main';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();
const port = 3000;
const app = express();
app.use(bodyParser.json());
app.all('/*', async (req, res) => {
  const response = await handler({
    queryStringParameters: req.query,
    pathParameters: { proxy: req.path.substring(1) },
    httpMethod: req.method,
    body: req.body,
  });
  res.status(response.statusCode);
  res.send(JSON.parse(response.body));
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
