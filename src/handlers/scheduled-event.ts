import axios from 'axios'
import axiosRetry from 'axios-retry'

import { getApiKeyById } from '../services/aws'
import { AxiosRequestConfig, AxiosRequestHeaders, ScheduledEvent } from '../types'
import { log, logError } from '../utils/logging'
import { xrayCaptureHttps } from '../utils/logging'

xrayCaptureHttps()
axiosRetry(axios, { retries: 3 })

const extractAxiosRequest = (event: ScheduledEvent): AxiosRequestConfig => {
  if (event.request?.url) {
    return event.request
  }
  throw new Error('No URL passed to scheduler-service')
}

const addApiKeyHeaders = async (headers: AxiosRequestHeaders, event: ScheduledEvent): Promise<AxiosRequestHeaders> => {
  if (event.apiKey) {
    const region = event.apiKey.region ?? 'us-east-2'
    return { ...headers, 'x-api-key': await getApiKeyById(event.apiKey.id, region) } as unknown as AxiosRequestHeaders
  }
  return headers
}

export const scheduledEventHandler = async (event: ScheduledEvent): Promise<any> => {
  try {
    log('Scheduled event URL', event.request?.url)
    const request = extractAxiosRequest(event)
    const headers = await addApiKeyHeaders((request.headers ?? {}) as AxiosRequestHeaders, event)
    const response = await axios({ ...request, headers })
    return response.data
  } catch (error) {
    logError({ error, rule: event.resources, url: event.request?.url })
  }
}
