import { isAxiosError } from 'axios'
import {
  API_ERROR_MESSAGES,
  BACKEND_MESSAGE_OVERRIDES,
  FIELD_LABELS,
  VALIDATION_RULE_TRANSLATIONS,
} from '@/constants/messages'
import type { ApiBusinessErrorBody, ApiValidationErrorBody } from '@/types/api'

function isBusinessError(data: unknown): data is ApiBusinessErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'mensaje' in data &&
    typeof (data as ApiBusinessErrorBody).mensaje === 'string'
  )
}

function isValidationError(data: unknown): data is ApiValidationErrorBody {
  return typeof data === 'object' && data !== null && 'message' in data
}

function normalizeBackendMessage(message: string): string {
  return BACKEND_MESSAGE_OVERRIDES[message] ?? message
}

export function translateValidationMessage(message: string): string {
  const fieldMatch = /^(?:property\s+)?([a-z_]+)\s+(.*)$/.exec(message)
  if (!fieldMatch) return message

  const [, field, rule] = fieldMatch
  const label = FIELD_LABELS[field]
  if (!label) return message

  const translation = VALIDATION_RULE_TRANSLATIONS.find(([pattern]) => pattern.test(rule))
  return `${label} ${translation?.[1] ?? 'tiene un valor inválido'}`
}

function describeValidationError(body: ApiValidationErrorBody): string {
  const messages = Array.isArray(body.message) ? body.message : [body.message]
  const translated = [...new Set(messages.map(translateValidationMessage))]
  return `${API_ERROR_MESSAGES.validationPrefix}: ${translated.join('; ')}.`
}

function describeStatus(status: number): string {
  if (status === 401) return API_ERROR_MESSAGES.unauthorized
  if (status === 403) return API_ERROR_MESSAGES.forbidden
  if (status === 404) return API_ERROR_MESSAGES.notFound
  if (status >= 500) return API_ERROR_MESSAGES.server
  return API_ERROR_MESSAGES.unexpected
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

export function parseApiError(error: unknown): string {
  if (!isAxiosError(error)) return API_ERROR_MESSAGES.unexpected
  if (!error.response) return API_ERROR_MESSAGES.network

  const { data, status } = error.response
  if (isBusinessError(data)) return normalizeBackendMessage(data.mensaje)
  if (isValidationError(data) && status === 400) return describeValidationError(data)
  return describeStatus(status)
}
