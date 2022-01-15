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

export const sendErrorEmail = async (event: ScheduledEvent, error: Error): Promise<string> => {
  try {
    const apiKey = await getApiKey(apiKeyName)
    const text = convertErrorToText(event, error)
    const email = convertTextToEmail(text)
    await axios.post('/v1/emails', email, { baseURL: apiUrl, headers: { 'x-api-key': apiKey } })
    log(error)
  } catch (error) {
    logError(error)
  }
  return `${error}`
}
