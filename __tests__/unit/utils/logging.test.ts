import * as AWSXRay from 'aws-xray-sdk-core'
import { log, logError, xrayCapture, xrayCaptureHttps } from '@utils/logging'
import { APIGatewayClient } from '@aws-sdk/client-api-gateway'
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
    const capturedDynamodb = 'captured-api-gateway' as unknown as APIGatewayClient
    const apiGateway = 'api-gateway'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSv3Client.mockReturnValue(capturedDynamodb)
    })

    test('expect AWSXRay.captureAWSv3Client when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(apiGateway)
      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledWith(apiGateway)
      expect(result).toEqual(capturedDynamodb)
    })

    test('expect same object when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(apiGateway)
      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledTimes(0)
      expect(result).toEqual(apiGateway)
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
