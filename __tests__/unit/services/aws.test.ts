import { getApiKey } from '../../../src/services/aws'

const mockGetApiKeys = jest.fn()
jest.mock('aws-sdk', () => ({
  APIGateway: jest.fn(() => ({
    getApiKeys: (...args) => ({ promise: () => mockGetApiKeys(...args) }),
  })),
}))

describe('aws', () => {
  describe('getApiKey', () => {
    const apiKeyName = 'api-key'
    const expectedValue = '97876453rwesfdg'

    beforeAll(() => {
      mockGetApiKeys.mockResolvedValue({ items: [{ value: expectedValue }] })
    })

    test('verify getApiKeys is called with expected values', async () => {
      await getApiKey(apiKeyName)
      expect(mockGetApiKeys).toHaveBeenCalledWith({
        includeValues: true,
        nameQuery: apiKeyName,
      })
    })

    test('result from getApiKeys to be returned', async () => {
      const result = await getApiKey(apiKeyName)
      expect(result).toEqual(expectedValue)
    })

    test.each([undefined, {}, { items: [] }, { items: [{}] }])(
      'expect empty key when data missing (data=%s)',
      async (resolvedValue) => {
        mockGetApiKeys.mockResolvedValueOnce(resolvedValue)
        const result = await getApiKey(apiKeyName)
        expect(result).toEqual('')
      }
    )
  })
})
