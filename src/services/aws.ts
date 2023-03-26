import { APIGatewayClient, GetApiKeyCommand } from '@aws-sdk/client-api-gateway'
import { xrayCapture } from '../utils/logging'

export const getApiKeyById = async (id: string, region = 'us-east-1'): Promise<string> => {
  const apiClient = xrayCapture(new APIGatewayClient({ apiVersion: '2015-07-09', region }))
  const command = new GetApiKeyCommand({
    apiKey: id,
    includeValue: true,
  })
  const response = await apiClient.send(command)
  return response.value
}
