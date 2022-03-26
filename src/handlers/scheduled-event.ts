import axios from 'axios'
import axiosRetry from 'axios-retry'

import { AxiosRequestConfig, ScheduledEvent, StringObject } from '../types'
import { log, logError } from '../utils/logging'
import { getApiKeyById } from '../services/aws'

axiosRetry(axios, { retries: 3 })

const extractAxiosRequest = (event: ScheduledEvent): AxiosRequestConfig => {
  if (event.request?.url) {
    return event.request
  }
  throw new Error('No URL passed to scheduler-service')
}

const addApiKeyHeaders = async (headers: StringObject, event: ScheduledEvent): Promise<StringObject> =>
  event.apiKey
    ? { ...headers, 'x-api-key': await getApiKeyById(event.apiKey.id, event.apiKey.region ?? 'us-east-2') }
    : headers

export const scheduledEventHandler = async (event: ScheduledEvent): Promise<any> => {
  try {
    log('Scheduled event URL', event.request?.url)
    const request = extractAxiosRequest(event)
    const headers = await addApiKeyHeaders(request.headers ?? {}, event)
    const response = await axios({ ...request, headers })
    return response.data
  } catch (error) {
    logError({ error, rule: event.resources, url: event.request?.url })
  }
}
