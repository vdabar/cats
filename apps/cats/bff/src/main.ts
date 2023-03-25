import {
  handleDeleteCat,
  handleGetCatById,
  handleGetCats,
  handleSearchCats,
  postCat,
} from './services/cats-service';
import { APIGatewayEvent, APIGatewayResponse } from 'aws-lambda';
async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  console.log('incoming event', event);
  let result;
  const queryParameters = event.queryStringParameters || {};
  try {
    switch (`${event.httpMethod} ${event.resource}`) {
      case 'GET /api/cats':
        result = await handleGetCats(queryParameters);
        break;
      case 'GET /api/cats/{id}':
        result = await handleGetCatById({ id: event.pathParameters.id });
        break;
      case 'GET /api/cats/search':
        result = await handleSearchCats(queryParameters);
        break;
      case 'DELETE /api/cats/{id}':
        result = await handleDeleteCat({ id: event.pathParameters.id });
        break;
      case 'POST /api/cats':
        result = await postCat(JSON.parse(event.body));
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
