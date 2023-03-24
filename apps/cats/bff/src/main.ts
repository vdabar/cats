import {
  handleDeleteCat,
  handleGetCats,
  handleSearchCats,
  postCat,
} from './services/cats-service';
import { APIGatewayEvent, APIGatewayResponse } from 'aws-lambda';
async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  console.log(event);
  let result;
  const queryParameters = event.queryStringParameters || {};
  try {
    switch (`${event.httpMethod} ${event.pathParameters.proxy}`) {
      case 'GET api/cats':
        result = await handleGetCats(queryParameters);
        break;
      case 'GET api/cats/search':
        result = await handleSearchCats(queryParameters);
        break;
      case 'DELETE api/cats':
        result = await handleDeleteCat(queryParameters);
        break;
      case 'POST api/cats':
        result = await postCat(event.body);
        break;
      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Not found' }),
        };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
}

export { handler };
