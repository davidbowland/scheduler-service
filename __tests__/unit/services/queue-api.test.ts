import axios from 'axios'
import { mocked } from 'jest-mock'

import { event } from '../__mocks__'
import { apiKeyName, apiUrl, notificationFrom, notificationTarget } from '@config'
import { ScheduledEvent } from '@handlers/scheduled-event'
import * as aws from '@services/aws'
import * as queueApi from '@services/queue-api'
import { convertErrorToText, sendErrorEmail } from '@services/queue-api'

jest.mock('axios')
jest.mock('axios-retry')
jest.mock('@services/aws')
const mockHandleErrorNoDefault = jest.fn()
jest.mock('@util/error-handling', () => ({
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
      mocked(aws).getApiKey.mockResolvedValue(apiKey)
    })

    test('expect getApiKey to be invoked with API key name', async () => {
      await sendErrorEmail(event, error)
      expect(mocked(aws).getApiKey).toHaveBeenCalledWith(apiKeyName)
    })

    test('expect handleErrorNoDefault to be invoked when getApiKey rejects', async () => {
      mocked(aws).getApiKey.mockRejectedValueOnce(undefined)
      await sendErrorEmail(event, error)
      expect(mockHandleErrorNoDefault).toHaveBeenCalled()
    })

    test('expect axios.post to be invoked with API key', async () => {
      await sendErrorEmail(event, error)
      expect(mocked(axios).post).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ headers: { 'x-api-key': apiKey } })
      )
    })

    test('expect axios.post to be invoked with correct content', async () => {
      const convertedText = 'hello\nworld\n'
      mockConvertErrorToText.mockReturnValue(convertedText)

      await sendErrorEmail(event, error)
      expect(mocked(axios).post).toHaveBeenCalledWith(
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
      ;(mocked(axios).post as jest.Mock).mockRejectedValueOnce(undefined)
      await sendErrorEmail(event, error)
      expect(mockHandleErrorNoDefault).toHaveBeenCalled()
    })

    test('expect returns error', async () => {
      const result = await sendErrorEmail(event, error)
      expect(result).toEqual(`${error}`)
    })
  })
})
