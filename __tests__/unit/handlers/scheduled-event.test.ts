import axios from 'axios'
import { mocked } from 'jest-mock'

import { event } from '../__mocks__'
import { ScheduledEvent, scheduledEventHandler } from '@handlers/scheduled-event'
import * as queueApi from '@services/queue-api'

jest.mock('axios')
jest.mock('axios-retry')
jest.mock('@services/queue-api')
jest.mock('@util/error-handling', () => ({
  log: () => () => undefined,
}))

describe('scheduled-event', () => {
  beforeAll(() => {
    mocked(axios).mockResolvedValue(undefined)
  })

  describe('scheduledEventHandler', () => {
    test('expect valid event invokes axios', async () => {
      await scheduledEventHandler(event)
      expect(mocked(axios)).toHaveBeenCalledWith(event.request)
    })

    test('expect axios reject invokes handleErrorNoDefault', async () => {
      const rejectReason = 'stomachache'
      mocked(axios).mockRejectedValueOnce(rejectReason)

      await scheduledEventHandler(event)
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
