import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, { retries: 3 })

// API Gateway

export const apiKeyName = 'emails-ApiAp-T7wqFPvc4X1x'

// Queue API

export const apiUrl = 'https://emails-queue-api.bowland.link'
export const notificationFrom = 'do-not-reply@bowland.link'
export const notificationTarget = 'scheduler-service-error@bowland.link'
