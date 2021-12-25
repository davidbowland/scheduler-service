import axios, { AxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry'

import { handleErrorNoDefault, log } from '../util/error-handling'

axiosRetry(axios, { retries: 3 })

const isValidRequest = (event: AxiosRequestConfig): boolean => Boolean(event.url)

export const scheduledEventHandler = (event: AxiosRequestConfig) =>
  isValidRequest(event)
    ? (log()('Scheduled event', event.url),
    axios(event)
      .then((response) => response.data)
      .catch(handleErrorNoDefault()))
    : Promise.reject(new Error('No URL passed to scheduler-service'))
