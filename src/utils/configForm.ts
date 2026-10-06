import type { ConfigDefinition, ConfigField } from '@/constants/configFields'
import type { ConfigValues } from '@/types/config'

export type ConfigDraft = Record<string, string | boolean>

export interface ParsedConfig {
  values: ConfigValues
  fieldErrors: Record<string, string>
  ruleErrors: string[]
  isValid: boolean
}

export function toDraft(definition: ConfigDefinition, values: ConfigValues): ConfigDraft {
  return Object.fromEntries(
    definition.fields.map((field) => {
      const value = values[field.key]
      return [field.key, field.type === 'boolean' ? Boolean(value) : String(value ?? '')]
    }),
  )
}

function rangeMessage(field: ConfigField): string {
  if (field.min !== undefined && field.max !== undefined)
    return `Debe estar entre ${field.min} y ${field.max}.`
  if (field.min !== undefined) return `Debe ser mayor o igual a ${field.min}.`
  return `Debe ser menor o igual a ${field.max}.`
}

function parseField(field: ConfigField, raw: string): { value?: number; error?: string } {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '') return { error: 'Escribe un valor.' }
  if (field.type === 'integer' && !/^\d+$/.test(normalized))
    return { error: 'Escribe un número entero.' }
  if (field.type === 'decimal' && !/^\d+(\.\d{1,2})?$/.test(normalized))
    return { error: 'Usa un número con máximo 2 decimales.' }
  const value = Number(normalized)
  if (
    (field.min !== undefined && value < field.min) ||
    (field.max !== undefined && value > field.max)
  )
    return { error: rangeMessage(field) }
  return { value }
}

export function parseConfigDraft(definition: ConfigDefinition, draft: ConfigDraft): ParsedConfig {
  const values: ConfigValues = {}
  const fieldErrors: Record<string, string> = {}
  for (const field of definition.fields) {
    const raw = draft[field.key]
    if (field.type === 'boolean') {
      values[field.key] = Boolean(raw)
      continue
    }
    const parsed = parseField(field, String(raw ?? ''))
    if (parsed.error) fieldErrors[field.key] = parsed.error
    else if (parsed.value !== undefined) values[field.key] = parsed.value
  }
  const hasFieldErrors = Object.keys(fieldErrors).length > 0
  const ruleErrors = hasFieldErrors
    ? []
    : definition.rules.filter((rule) => !rule.check(values)).map((rule) => rule.message)
  return { values, fieldErrors, ruleErrors, isValid: !hasFieldErrors && ruleErrors.length === 0 }
}

export function changedValues(original: ConfigValues, next: ConfigValues): ConfigValues {
  return Object.fromEntries(Object.entries(next).filter(([key, value]) => original[key] !== value))
}
