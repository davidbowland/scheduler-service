// Import all functions from scheduled-event-logger.js
import { scheduledEventHandler } from '../../../src/handlers/scheduled-event'

const mockAxios = jest.fn()
jest.mock(
  'axios',
  () =>
    (...args) =>
      mockAxios(...args)
)
jest.mock('axios-retry')

const mockHandleErrorNoDefault = jest.fn()
const mockLog = jest.fn()
jest.mock('../../../src/util/error-handling', () => ({
  handleErrorNoDefault:
    () =>
      (...args) =>
        mockHandleErrorNoDefault(...args),
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
    const event = { url: 'http://api.bowland.link/v1/plural-noun' }

    test('expect valid event invokes axios', async () => {
      await scheduledEventHandler(event)
      expect(mockAxios).toHaveBeenCalledWith(event)
    })

    test('expect axios reject invokes handleErrorNoDefault', async () => {
      const rejectReason = 'stomachache'
      mockAxios.mockRejectedValueOnce(rejectReason)

      await scheduledEventHandler(event)
      expect(mockHandleErrorNoDefault).toHaveBeenCalledWith(rejectReason)
    })

    test('expect invalid event rejects', async () => {
      await expect(scheduledEventHandler({})).rejects.toBeTruthy()
    })
  })
})
