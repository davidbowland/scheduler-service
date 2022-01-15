import { logError, logErrorWithDefault, log } from '@utils/logging'

describe('logging', () => {
  const consoleError = console.error
  const consoleLog = console.log

  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.error = consoleError
    console.log = consoleLog
  })

  describe('logError', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message',
      async (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)

        await logError(error)
        expect(console.error).toHaveBeenCalledWith(error)
      }
    )
  })

  describe('logErrorWithDefault', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])('expect value back when passed', async (value) => {
      const message = `Error message for value ${JSON.stringify(value)}`
      const error = new Error(message)

      const result = logErrorWithDefault(value)
      expect(await result(error)).toEqual(value)
    })

    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message',
      async (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)

        const result = logErrorWithDefault(value)
        await result(error)
        expect(console.error).toHaveBeenCalledWith(error)
      }
    )
  })

  describe('log', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message',
      async (value) => {
        const message = `Log message for value ${JSON.stringify(value)}`

        await log(message)
        expect(console.log).toHaveBeenCalledWith(message)
      }
    )
  })
})
