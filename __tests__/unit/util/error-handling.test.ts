import { handleErrorNoDefault, log } from '../../../src/util/error-handling'

describe('error-handling', () => {
  const logFunc = jest.fn()

  describe('handleErrorNoDefault', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message (message=%s)',
      (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)

        const result = handleErrorNoDefault(logFunc)
        result(error)
        expect(logFunc).toHaveBeenCalledWith(error)
      }
    )
  })

  describe('log', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message (message=%s)',
      (value) => {
        const message = `Log message for value ${JSON.stringify(value)}`

        const result = log(logFunc)
        result(message)
        expect(logFunc).toHaveBeenCalledWith(message)
      }
    )
  })
})
