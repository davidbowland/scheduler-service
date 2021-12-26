import { event } from '../__mocks__'
import { apiKeyName, apiUrl, notificationFrom, notificationTarget } from '../../../src/config'
import { ScheduledEvent } from '../../../src/handlers/scheduled-event'
import * as queueApi from '../../../src/services/queue-api'
import { convertErrorToText, sendErrorEmail } from '../../../src/services/queue-api'

const mockPost = jest.fn()
jest.mock('axios', () => ({
  post: (...args) => mockPost(...args),
}))
jest.mock('axios-retry')
const mockGetApiKey = jest.fn()
jest.mock('../../../src/services/aws', () => ({
  getApiKey: (...args) => mockGetApiKey(...args),
}))
const mockHandleErrorNoDefault = jest.fn()
jest.mock('../../../src/util/error-handling', () => ({
  handleErrorNoDefault:
    () =>
      (...args) =>
        mockHandleErrorNoDefault(...args),
}))

describe('queue-api', () => {
  const error = new Error('SNAFU')

  describe('convertErrorToText', () => {
    test.each([
      [event, '[&quot;arn:aws:events:us-east-2::rule/test-rule&quot;]', 'http://api.bowland.link/v1/plural-noun'],
      [undefined, 'undefined', 'undefined'],
      [{}, 'undefined', 'undefined'],
      [{ request: {} }, 'undefined', 'undefined'],
    ])('expect event=%s generates text=%', (tempEvent, expectedRule, expectedUrl) => {
      const result = convertErrorToText(tempEvent as ScheduledEvent, error)
      expect(result).toEqual(
        `There was an error processing EventBridge rule ${expectedRule}\n\nUnable to invoke URL: ${expectedUrl}\n\nEncountered error: Error: SNAFU`
      )
    })
  })

  describe('sendErrorEmail', () => {
    const apiKey = '87654esdxcvhtre'
    const mockConvertErrorToText = jest.spyOn(queueApi, 'convertErrorToText')

    beforeAll(() => {
      mockGetApiKey.mockResolvedValue(apiKey)
    })

    test('expect getApiKey to be invoked with API key name', async () => {
      await sendErrorEmail(event, error)
      expect(mockGetApiKey).toHaveBeenCalledWith(apiKeyName)
    })

    test('expect handleErrorNoDefault to be invoked when getApiKey rejects', async () => {
      mockGetApiKey.mockRejectedValueOnce(undefined)
      await sendErrorEmail(event, error)
      expect(mockHandleErrorNoDefault).toHaveBeenCalled()
    })

    test('expect axios.post to be invoked with API key', async () => {
      await sendErrorEmail(event, error)
      expect(mockPost).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ headers: { 'x-api-key': apiKey } })
      )
    })

    test('expect axios.post to be invoked with correct content', async () => {
      const convertedText = 'hello\nworld\n'
      mockConvertErrorToText.mockReturnValue(convertedText)

      await sendErrorEmail(event, error)
      expect(mockPost).toHaveBeenCalledWith(
        '/v1/emails',
        {
          from: notificationFrom,
          html: `<p>${convertedText.replace(/\n/g, '<br>')}</p>`,
          references: [],
          replyTo: notificationFrom,
          sender: notificationFrom,
          subject: 'Error executing EventBridge event',
          text: convertedText,
          to: [notificationTarget],
        },
        expect.objectContaining({ baseURL: apiUrl })
      )
    })

    test('expect handleErrorNoDefault to be invoked when axios.post rejects', async () => {
      mockPost.mockRejectedValueOnce(undefined)
      await sendErrorEmail(event, error)
      expect(mockHandleErrorNoDefault).toHaveBeenCalled()
    })

    test('expect returns error', async () => {
      const result = await sendErrorEmail(event, error)
      expect(result).toEqual(`Error: ${error}`)
    })
  })
})
