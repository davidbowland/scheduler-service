import axios from 'axios'
import { mocked } from 'jest-mock'

import * as awsService from '@services/aws'
import * as logging from '@utils/logging'
import { apiKey, event } from '../__mocks__'
import { ScheduledEvent } from '@types'
import { scheduledEventHandler } from '@handlers/scheduled-event'

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
    test('expect valid event invokes axios', async () => {
      await scheduledEventHandler(event)
      expect(mocked(axios)).toHaveBeenCalledWith(expect.objectContaining(event.request))
    })

    test('expect API key header added when requested', async () => {
      const apiKeyEvent = { ...event, apiKey: { id: 'anApiKey', region: 'us-west-2' } }

      await scheduledEventHandler(apiKeyEvent)
      expect(mocked(awsService).getApiKeyById).toHaveBeenCalledWith('anApiKey', 'us-west-2')
      expect(mocked(axios)).toHaveBeenCalledWith(expect.objectContaining({ headers: { 'x-api-key': apiKey } }))
    })

    test('expect API key header defaults to us-east-2', async () => {
      const apiKeyEvent = { ...event, apiKey: { id: 'anApiKey' } } as unknown as ScheduledEvent

      await scheduledEventHandler(apiKeyEvent)
      expect(mocked(awsService).getApiKeyById).toHaveBeenCalledWith('anApiKey', 'us-east-2')
    })

    test('expect axios reject invokes logError and sendErrorEmail', async () => {
      const rejectReason = 'stomachache'
      mocked(axios).mockRejectedValueOnce(rejectReason)

      await scheduledEventHandler(event)
      expect(mocked(logging).logError).toHaveBeenCalledWith({
        error: 'stomachache',
        rule: ['arn:aws:events:us-east-2::rule/test-rule'],
        url: 'http://api.bowland.link/v1/plural-noun',
      })
    })

    test('expect invalid event logs error', async () => {
      const invalidEvent = {} as ScheduledEvent
      await scheduledEventHandler(invalidEvent)
      expect(mocked(logging).logError).toHaveBeenCalledWith({
        error: new Error('No URL passed to scheduler-service'),
        rule: undefined,
        url: undefined,
      })
    })

    test('expect event with no request logs error', async () => {
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
