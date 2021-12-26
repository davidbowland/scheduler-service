import axios from 'axios'
import escape from 'escape-html'

import { getApiKey } from './aws'
import { apiKeyName, apiUrl, notificationFrom, notificationTarget } from '../config'
import { ScheduledEvent } from '../handlers/scheduled-event'
import { handleErrorNoDefault } from '../util/error-handling'

/* Emails */

export const convertErrorToText = (event: ScheduledEvent, error: unknown): string =>
  `There was an error processing EventBridge rule ${escape(
    JSON.stringify(event?.resources)
  )}\n\nUnable to invoke URL: ${escape(event?.request?.url)}\n\nEncountered error: ${escape(error)}`

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
    .catch(handleErrorNoDefault())
    .then(() => `Error: ${error}`)
