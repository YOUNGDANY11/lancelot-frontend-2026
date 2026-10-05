import { format, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const API_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = parseISO(value.slice(0, 10))
  return isValid(parsed) ? parsed : null
}

export function isValidApiDate(value: string): boolean {
  if (!API_DATE_PATTERN.test(value)) return false
  const parsed = parseApiDate(value)
  return parsed !== null && toApiDate(parsed) === value
}

export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayApiDate(): string {
  return toApiDate(new Date())
}

export function formatDate(value: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  const parsed = parseApiDate(value)
  return parsed ? format(parsed, pattern, { locale: es }) : ''
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  const parsed = parseISO(value)
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy, HH:mm', { locale: es }) : ''
}
