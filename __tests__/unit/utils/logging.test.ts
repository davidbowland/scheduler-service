import { APIGatewayClient } from '@aws-sdk/client-api-gateway'
import * as AWSXRay from 'aws-xray-sdk-core'
import https from 'https'
import { mocked } from 'jest-mock'

import { log, logError, xrayCapture, xrayCaptureHttps } from '@utils/logging'

jest.mock('aws-xray-sdk-core')

describe('logging', () => {
  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  describe('log', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'should call console.log with message for value %s',
      async (value) => {
        const message = `Log message for value ${JSON.stringify(value)}`
        await log(message)

        expect(console.log).toHaveBeenCalledWith(message)
      },
    )
  })

  describe('logError', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'should call console.error with error for value %s',
      async (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)
        await logError(error)

        expect(console.error).toHaveBeenCalledWith(error)
      },
    )
  })

  describe('xrayCapture', () => {
    const capturedDynamodb = 'captured-api-gateway' as unknown as APIGatewayClient
    const apiGateway = 'api-gateway'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSv3Client.mockReturnValue(capturedDynamodb)
    })

    it('should use AWSXRay.captureAWSv3Client when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(apiGateway)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledWith(apiGateway)
      expect(result).toEqual(capturedDynamodb)
    })

    it('should return same object when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(apiGateway)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledTimes(0)
      expect(result).toEqual(apiGateway)
    })
  })

  describe('xrayCaptureHttps', () => {
    it('should use AWSXRay.captureHTTPsGlobal when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      xrayCaptureHttps()

      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledWith(https)
    })

    it('should not call captureHTTPsGlobal when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      xrayCaptureHttps()

      expect(mocked(AWSXRay).captureHTTPsGlobal).toHaveBeenCalledTimes(0)
    })
  })
})
