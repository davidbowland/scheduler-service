import { APIGateway } from 'aws-sdk'

const apigateway = new APIGateway({ apiVersion: '2015-07-09', region: 'us-east-1' })

export const getApiKey = (name: string): Promise<string> =>
  apigateway
    .getApiKeys({
      includeValues: true,
      nameQuery: name,
    })
    .promise()
    .then((response) => response.items[0].value)
