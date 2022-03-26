import { getApiKeyById } from '@services/aws'

const mockApiGateway = jest.fn()
const mockGetApiKey = jest.fn()
jest.mock('aws-sdk', () => ({
  APIGateway: jest.fn((...args) =>
    mockApiGateway.mockReturnValue({
      getApiKey: (...args) => ({ promise: () => mockGetApiKey(...args) }),
    })(...args)
  ),
}))

describe('aws', () => {
  describe('getApiKeyById', () => {
    const apiKeyId = 'api-key'
    const expectedValue = '97876453rwesfdg'

    beforeAll(() => {
      mockGetApiKey.mockResolvedValue({ value: expectedValue })
    })

    test('expect APIGateway instantiated with correct region', async () => {
      await getApiKeyById(apiKeyId, 'us-west-2')
      expect(mockApiGateway).toHaveBeenCalledWith(expect.objectContaining({ region: 'us-west-2' }))
    })

    test('expect getApiKeys is called with name and includeValues', async () => {
      await getApiKeyById(apiKeyId)
      expect(mockGetApiKey).toHaveBeenCalledWith({
        apiKey: apiKeyId,
        includeValue: true,
      })
    })

    test('result from getApiKeys to be returned', async () => {
      const result = await getApiKeyById(apiKeyId)
      expect(result).toEqual(expectedValue)
    })
  })
})
