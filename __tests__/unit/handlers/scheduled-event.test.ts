import axios from 'axios'
import { mocked } from 'jest-mock'

import { apiKey, event } from '../__mocks__'
import { scheduledEventHandler } from '@handlers/scheduled-event'
import * as awsService from '@services/aws'
import { ScheduledEvent } from '@types'
import * as logging from '@utils/logging'

jest.mock('axios')
jest.mock('axios-retry')
jest.mock('@services/aws')
jest.mock('@utils/logging')

describe('scheduled-event', () => {
  beforeAll(() => {
    mocked(axios).mockResolvedValue(undefined)
    mocked(awsService).getApiKeyById.mockResolvedValue(apiKey)
  })

  describe('scheduledEventHandler', () => {
    it('should invoke axios with a valid event', async () => {
      await scheduledEventHandler(event)

      expect(mocked(axios)).toHaveBeenCalledWith(expect.objectContaining(event.request))
    })

    it('should add API key header when requested', async () => {
      const apiKeyEvent = { ...event, apiKey: { id: 'anApiKey', region: 'us-west-2' } }
      await scheduledEventHandler(apiKeyEvent)

      expect(mocked(awsService).getApiKeyById).toHaveBeenCalledWith('anApiKey', 'us-west-2')
      expect(mocked(axios)).toHaveBeenCalledWith(expect.objectContaining({ headers: { 'x-api-key': apiKey } }))
    })

    it('should default API key header region to us-east-2', async () => {
      const apiKeyEvent = { ...event, apiKey: { id: 'anApiKey' } } as unknown as ScheduledEvent
      await scheduledEventHandler(apiKeyEvent)

      expect(mocked(awsService).getApiKeyById).toHaveBeenCalledWith('anApiKey', 'us-east-2')
    })

    it('should invoke logError when axios rejects', async () => {
      const rejectReason = 'stomachache'
      mocked(axios).mockRejectedValueOnce(rejectReason)
      await scheduledEventHandler(event)

      expect(mocked(logging).logError).toHaveBeenCalledWith({
        error: 'stomachache',
        rule: ['arn:aws:events:us-east-2::rule/test-rule'],
        url: 'http://api.bowland.link/v1/plural-noun',
      })
    })

    it('should log error for invalid event', async () => {
      const invalidEvent = {} as ScheduledEvent
      await scheduledEventHandler(invalidEvent)

      expect(mocked(logging).logError).toHaveBeenCalledWith({
        error: new Error('No URL passed to scheduler-service'),
        rule: undefined,
        url: undefined,
      })
    })

    it('should log error for event with no request', async () => {
      const invalidEvent = { ...event, request: undefined } as ScheduledEvent
      await scheduledEventHandler(invalidEvent)

      expect(mocked(logging).logError).toHaveBeenCalledWith({
        error: new Error('No URL passed to scheduler-service'),
        rule: ['arn:aws:events:us-east-2::rule/test-rule'],
        url: undefined,
      })
    })
  })
})
