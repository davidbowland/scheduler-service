import axios from 'axios'

import { sendErrorEmail } from '../services/queue-api'
import { AxiosRequestConfig, ScheduledEvent } from '../types'
import { log } from '../utils/logging'

const extractAxiosRequest = (event: ScheduledEvent): AxiosRequestConfig => {
  if (event.request?.url) {
    return event.request
  }
  throw new Error('No URL passed to scheduler-service')
}

export const scheduledEventHandler = async (event: ScheduledEvent): Promise<any> => {
  try {
    log('Scheduled event URL', event.request?.url)
    const request = await extractAxiosRequest(event)
    const response = await axios(request)
    return response.data
  } catch (error) {
    sendErrorEmail(event, error)
  }
}
