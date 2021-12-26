import { event } from '../__mocks__'
import { ScheduledEvent, scheduledEventHandler } from '../../../src/handlers/scheduled-event'

const mockAxios = jest.fn()
jest.mock(
  'axios',
  () =>
    (...args) =>
      mockAxios(...args)
)
jest.mock('axios-retry')

const mockSendErrorEmail = jest.fn()
jest.mock('../../../src/services/queue-api', () => ({
  sendErrorEmail: (...args) => mockSendErrorEmail(...args),
}))
const mockLog = jest.fn()
jest.mock('../../../src/util/error-handling', () => ({
  log:
    () =>
      (...args) =>
        mockLog(...args),
}))

describe('scheduled-event', () => {
  beforeAll(() => {
    mockAxios.mockResolvedValue(undefined)
  })

  describe('scheduledEventHandler', () => {
    test('expect valid event invokes axios', async () => {
      await scheduledEventHandler(event)
      expect(mockAxios).toHaveBeenCalledWith(event.request)
    })

    test('expect axios reject invokes handleErrorNoDefault', async () => {
      const rejectReason = 'stomachache'
      mockAxios.mockRejectedValueOnce(rejectReason)

      await scheduledEventHandler(event)
      expect(mockSendErrorEmail).toHaveBeenCalledWith(event, rejectReason)
    })

    test('expect invalid event rejects', async () => {
      const invalidEvent = {} as ScheduledEvent
      await scheduledEventHandler(invalidEvent)
      expect(mockSendErrorEmail).toHaveBeenCalledWith(invalidEvent, new Error('No URL passed to scheduler-service'))
    })
  })
})
