import { AxiosRequestConfig } from 'axios'
export { AxiosRequestConfig } from 'axios'

export interface ScheduledEvent {
  request: AxiosRequestConfig
  resources: string[]
}
