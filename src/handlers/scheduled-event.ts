import axios from 'axios'

import { sendErrorEmail } from '../services/queue-api'
import { AxiosRequestConfig, ScheduledEvent } from '../types'
import { log } from '../utils/logging'

const extractAxiosRequest = (event: ScheduledEvent): Promise<AxiosRequestConfig> =>
  event?.request?.url ? Promise.resolve(event.request) : Promise.reject(new Error('No URL passed to scheduler-service'))

export const scheduledEventHandler = (event: ScheduledEvent) =>
  log('Scheduled event URL', event.request?.url)
    .then(() => extractAxiosRequest(event))
    .then(axios)
    .then((response) => response.data)
    .catch((error) => sendErrorEmail(event, error))
