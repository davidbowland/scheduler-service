import { APIGatewayClient, GetApiKeyCommand } from '@aws-sdk/client-api-gateway'

export const getApiKeyById = async (id: string, region = 'us-east-1'): Promise<string | undefined> => {
  const apiClient = new APIGatewayClient({ apiVersion: '2015-07-09', region })
  const command = new GetApiKeyCommand({
    apiKey: id,
    includeValue: true,
  })
  const response = await apiClient.send(command)
  return response.value
}
