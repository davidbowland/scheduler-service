import axios from 'axios'
import escape from 'escape-html'

import { getApiKey } from './aws'
import { apiKeyName, apiUrl, notificationFrom, notificationTarget } from '../config'
import { ScheduledEvent } from '../types'
import { log, logError } from '../utils/logging'

/* Emails */

export const convertErrorToText = (event: ScheduledEvent, error: Error): string =>
  `There was an error processing EventBridge rule ${escape(
    JSON.stringify(event?.resources)
  )}\n\nUnable to invoke URL: ${escape(
    event?.request?.url
  )}\n\nAt ${new Date().toISOString()} encountered error: ${escape(error as unknown as string)}\n${escape(error.stack)}`

const convertTextToEmail = (text: string) => ({
  from: notificationFrom,
  sender: notificationFrom,
  to: [notificationTarget],
  replyTo: notificationFrom,
  references: [],
  subject: 'Error executing EventBridge event',
  text: text,
  html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
})

export const sendErrorEmail = (event: ScheduledEvent, error: unknown): Promise<unknown> =>
  getApiKey(apiKeyName)
    .then((apiKey) =>
      Promise.resolve(exports.convertErrorToText(event, error))
        .then(convertTextToEmail)
        .then((body) => axios.post('/v1/emails', body, { baseURL: apiUrl, headers: { 'x-api-key': apiKey } }))
    )
    .then(() => log(error))
    .catch(logError)
    .then(() => `${error}`)
