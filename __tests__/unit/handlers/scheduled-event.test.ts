import axios from 'axios'
import { mocked } from 'jest-mock'

import { apiKey, event } from '../__mocks__'
import { scheduledEventHandler } from '@handlers/scheduled-event'
import * as awsService from '@services/aws'
import * as queueApi from '@services/queue-api'
import { ScheduledEvent } from '@types'
import * as logging from '@utils/logging'

jest.mock('axios')
jest.mock('axios-retry')
jest.mock('@services/aws')
jest.mock('@services/queue-api')
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
      expect(mocked(logging).logError).toHaveBeenCalledWith(rejectReason)
      expect(mocked(queueApi).sendErrorEmail).toHaveBeenCalledWith(event, rejectReason)
    })

    test('expect invalid event rejects', async () => {
      const invalidEvent = {} as ScheduledEvent
      await scheduledEventHandler(invalidEvent)
      expect(mocked(queueApi).sendErrorEmail).toHaveBeenCalledWith(
        invalidEvent,
        new Error('No URL passed to scheduler-service')
      )
    })
  })
})
