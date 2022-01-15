import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, { retries: 3 })

// Queue API

export const apiKeyName = process.env.API_KEY_NAME as string
export const apiUrl = process.env.API_KEY_URL as string
export const notificationFrom = process.env.NOTIFICATION_FROM as string
export const notificationTarget = process.env.NOTIFICATION_TARGET as string
