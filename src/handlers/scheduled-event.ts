import axios, { AxiosRequestConfig } from 'axios'

import { sendErrorEmail } from '../services/queue-api'
import { log } from '../util/error-handling'

export interface ScheduledEvent {
  request: AxiosRequestConfig
  resources: string[]
}

const extractAxiosRequest = (event: ScheduledEvent): Promise<AxiosRequestConfig> =>
  event?.request?.url ? Promise.resolve(event.request) : Promise.reject(new Error('No URL passed to scheduler-service'))

const logUrl = (request: AxiosRequestConfig): AxiosRequestConfig => (log()('Scheduled event URL', request.url), request)

export const scheduledEventHandler = (event: ScheduledEvent) =>
  extractAxiosRequest(event)
    .then(logUrl)
    .then(axios)
    .then((response) => response.data)
    .catch((error) => sendErrorEmail(event, error))
