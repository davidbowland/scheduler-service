import { AxiosRequestConfig } from 'axios'
export { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'

export interface ScheduledEvent {
  apiKey?: {
    id: string
    region: string
  }
  request: AxiosRequestConfig
  resources: string[]
}

export interface StringObject {
  [key: string]: string
}
