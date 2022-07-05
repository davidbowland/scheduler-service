import * as AWSXRay from 'aws-xray-sdk-core'
import { log, logError, xrayCapture, xrayCaptureHttps } from '@utils/logging'
import https from 'https'
import { mocked } from 'jest-mock'

jest.mock('aws-xray-sdk-core')

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

  describe('xrayCapture', () => {
    const capturedDynamodb = 'captured_dynamodb'
    const dynamodb = 'dynamodb'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSClient.mockReturnValue(capturedDynamodb)
    })

    test('expect AWSXRay.captureAWSClient when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(dynamodb)
      expect(mocked(AWSXRay).captureAWSClient).toHaveBeenCalledWith(dynamodb)
      expect(result).toEqual(capturedDynamodb)
    })

    test('expect same object when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(dynamodb)
      expect(mocked(AWSXRay).captureAWSClient).toHaveBeenCalledTimes(0)
      expect(result).toEqual(dynamodb)
    })
  })

  describe('xrayCaptureHttps', () => {
    test('expect AWSXRay.captureHTTPsGlobal when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      xrayCaptureHttps()
      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledWith(https)
    })

    test('expect same object when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      xrayCaptureHttps()
      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledTimes(0)
    })
  })
})
