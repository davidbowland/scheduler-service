import { APIGateway } from 'aws-sdk'

export const getApiKeyById = (id: string, region = 'us-east-1'): Promise<string> =>
  new APIGateway({ apiVersion: '2015-07-09', region })
    .getApiKey({
      apiKey: id,
      includeValue: true,
    })
    .promise()
    .then((response) => response.value)
