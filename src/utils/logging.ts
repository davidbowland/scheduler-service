import AWSXRay from 'aws-xray-sdk-core'
import https from 'https'

export const log = (...args: any[]): unknown => console.log(...args)

export const logError = (...args: any[]): unknown => console.error(...args)

export const xrayCapture = (x: any): any => (process.env.AWS_SAM_LOCAL === 'true' ? x : AWSXRay.captureAWSv3Client(x))

export const xrayCaptureHttps = (): void =>
  process.env.AWS_SAM_LOCAL === 'true' ? undefined : AWSXRay.captureHTTPsGlobal(https)
