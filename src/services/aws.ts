import { APIGateway } from 'aws-sdk'
import { xrayCapture } from '../utils/logging'

export const getApiKeyById = (id: string, region = 'us-east-1'): Promise<string> =>
  xrayCapture(new APIGateway({ apiVersion: '2015-07-09', region }))
    .getApiKey({
      apiKey: id,
      includeValue: true,
    })
    .promise()
    .then((response: any) => response.value)
