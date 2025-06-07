import { getApiKeyById } from '@services/aws'

const mockApiGateway = jest.fn()
const mockSend = jest.fn()
jest.mock('@aws-sdk/client-api-gateway', () => ({
  APIGatewayClient: jest.fn((...args) =>
    mockApiGateway.mockReturnValue({
      send: (...args) => mockSend(...args),
    })(...args),
  ),
  GetApiKeyCommand: jest.fn().mockImplementation((x) => x),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('aws', () => {
  describe('getApiKeyById', () => {
    const apiKeyId = 'api-key'
    const expectedValue = '97876453rwesfdg'

    beforeAll(() => {
      mockSend.mockResolvedValue({ value: expectedValue })
    })

    it('should instantiate APIGateway with correct region', async () => {
      await getApiKeyById(apiKeyId, 'us-west-2')

      expect(mockApiGateway).toHaveBeenCalledWith(expect.objectContaining({ region: 'us-west-2' }))
    })

    it('should call getApiKeys with name and includeValues', async () => {
      await getApiKeyById(apiKeyId)

      expect(mockSend).toHaveBeenCalledWith({
        apiKey: apiKeyId,
        includeValue: true,
      })
    })

    it('should return result from getApiKeys', async () => {
      const result = await getApiKeyById(apiKeyId)

      expect(result).toEqual(expectedValue)
    })
  })
})
