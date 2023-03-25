import { handler } from './main';
import { DynamoDB } from 'aws-sdk';

describe('handler', () => {
  let scanSpy: jest.SpyInstance;
  let deleteSpy: jest.SpyInstance;
  let putSpy: jest.SpyInstance;
  let querySpy: jest.SpyInstance;
  let getSpy: jest.SpyInstance;

  beforeEach(() => {
    scanSpy = jest.spyOn(DynamoDB.DocumentClient.prototype, 'scan');
    deleteSpy = jest.spyOn(DynamoDB.DocumentClient.prototype, 'delete');
    putSpy = jest.spyOn(DynamoDB.DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(DynamoDB.DocumentClient.prototype, 'query');
    getSpy = jest.spyOn(DynamoDB.DocumentClient.prototype, 'get');
  });

  afterEach(() => {
    scanSpy.mockRestore();
    deleteSpy.mockRestore();
    putSpy.mockRestore();
    querySpy.mockRestore();
    getSpy.mockRestore();
    jest.resetAllMocks();
  });

  describe('when httpMethod is GET and resource is /api/cats', () => {
    it('when queryStringParameters not provided should return cats array with status code 200', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats',
        queryStringParameters: {},
      };
      const scanResult = {
        Items: [
          {
            id: '1',
            name: 'Fluffy',
            catGroup: 'A',
            weight: '9',
            weightType: 'kg',
          },
        ],
      };
      scanSpy.mockReturnValue({ promise: () => Promise.resolve(scanResult) });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "[{"id":"1","name":"Fluffy","catGroup":"A","weight":"9","weightType":"kg"}]",
          "statusCode": 200,
        }
      `);
    });

    it('when queryStringParameters provided should return cats array with status code 200', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats',
        queryStringParameters: {
          name: 'Fluffy',
        },
      };
      const queryResult = {
        Items: [
          {
            id: '1',
            name: 'Fluffy',
            catGroup: 'A',
            weight: '9',
            weightType: 'kg',
          },
        ],
      };
      querySpy.mockReturnValue({ promise: () => Promise.resolve(queryResult) });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "[{"id":"1","name":"Fluffy","catGroup":"A","weight":"9","weightType":"kg"}]",
          "statusCode": 200,
        }
      `);
    });
    it('should return message with status code 500', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats',
        queryStringParameters: {
          name: 'Fluffy',
        },
      };
      querySpy.mockReturnValue({
        promise: () => Promise.reject({ message: 'error' }),
      });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "{"message":"error"}",
          "statusCode": 500,
        }
      `);
    });
  });

  describe('when httpMethod is GET and resource is /api/cats/:id', () => {
    it('should return cat and status code 200', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats/{id}',
        pathParameters: { id: '1' },
      };
      const getResult = {
        Item: {
          id: '1',
          name: 'Fluffy',
          catGroup: 'A',
          weight: '9',
          weightType: 'kg',
        },
      };
      getSpy.mockReturnValue({ promise: () => Promise.resolve(getResult) });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "{"id":"1","name":"Fluffy","catGroup":"A","weight":"9","weightType":"kg"}",
          "statusCode": 200,
        }
      `);
    });
  });

  describe('when httpMethod is GET and resource is /api/cats/search', () => {
    const queryResult = {
      Items: [
        {
          id: '1',
          name: 'Fluffy',
          catGroup: 'A',
          weight: '9',
          weightType: 'kg',
        },
        {
          id: '2',
          name: 'Fluffy',
          catGroup: 'B',
          weight: '9',
          weightType: 'kg',
        },
        {
          id: '1',
          name: 'Fluffy',
          catGroup: 'C',
          weight: '9',
          weightType: 'kg',
        },
      ],
    };

    it('should return 2 cats with name Fluffy sorted desc by field breed', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats/search',
        queryStringParameters: {
          name: 'Fluffy',
          page: '0',
          pageSize: '2',
          sortField: 'catGroup',
          sort: 'desc',
        },
      };
      querySpy.mockReturnValue({ promise: () => Promise.resolve(queryResult) });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "[{"id":"2","name":"Fluffy","catGroup":"B","weight":"9","weightType":"kg"},{"id":"1","name":"Fluffy","catGroup":"A","weight":"9","weightType":"kg"}]",
          "statusCode": 200,
        }
      `);
    });

    it('should return cats sorted asc by field breed', async () => {
      const mockEvent = {
        httpMethod: 'GET',
        resource: '/api/cats/search',
        queryStringParameters: {
          sortField: 'catGroup',
          sort: 'asc',
        },
      };
      scanSpy.mockReturnValue({ promise: () => Promise.resolve(queryResult) });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "[{"id":"1","name":"Fluffy","catGroup":"A","weight":"9","weightType":"kg"},{"id":"2","name":"Fluffy","catGroup":"B","weight":"9","weightType":"kg"},{"id":"1","name":"Fluffy","catGroup":"C","weight":"9","weightType":"kg"}]",
          "statusCode": 200,
        }
      `);
    });
  });

  describe('when httpMethod is DELETE and resource is /api/cats/:id', () => {
    it('should call handleDeleteCat without query parameters', async () => {
      const mockEvent = {
        httpMethod: 'DELETE',
        resource: '/api/cats/{id}',
        pathParameters: { id: '1' },
      };
      deleteSpy.mockReturnValue({ promise: () => Promise.resolve() });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "{"message":"Cat deleted"}",
          "statusCode": 200,
        }
      `);
    });
  });

  describe('when httpMethod is POST and resource is /api/cats', () => {
    it('should return message with statusCode 200', async () => {
      const mockEvent = {
        httpMethod: 'POST',
        resource: '/api/cats',
        body: JSON.stringify({
          id: '1',
          name: 'baitas',
          catGroup: 'bulldog',
          weight: '9',
          weightType: 'kg',
        }),
      };
      putSpy.mockReturnValue({ promise: () => Promise.resolve() });
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "{"message":"Cat added"}",
          "statusCode": 200,
        }
      `);
    });
  });

  describe('when httpMethod is POST and resource is UNKNOWN', () => {
    it('should return 404', async () => {
      const mockEvent = {
        httpMethod: 'POST',
        resource: '/api/unknown',
      };
      const response = await handler(mockEvent);
      expect(response).toMatchInlineSnapshot(`
        {
          "body": "{"message":"Not found"}",
          "statusCode": 404,
        }
      `);
    });
  });
});
