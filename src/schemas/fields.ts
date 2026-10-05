import { z } from 'zod'
import { API_DATE_PATTERN, isValidApiDate, todayApiDate } from '@/utils/formatDate'

export const FIELD_LIMITS = {
  email: { min: 8, max: 150 },
  password: { min: 6, max: 255 },
  personName: { min: 2, max: 100 },
  oldestBirthYear: 1900,
} as const

export const emailField = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo.')
  .pipe(
    z
      .email('Escribe un correo válido, por ejemplo nombre@club.com.')
      .min(
        FIELD_LIMITS.email.min,
        `El correo debe tener al menos ${FIELD_LIMITS.email.min} caracteres.`,
      )
      .max(
        FIELD_LIMITS.email.max,
        `El correo no puede superar ${FIELD_LIMITS.email.max} caracteres.`,
      ),
  )

export function passwordField(requiredMessage = 'Escribe tu contraseña.') {
  return z
    .string()
    .min(1, requiredMessage)
    .min(
      FIELD_LIMITS.password.min,
      `La contraseña debe tener al menos ${FIELD_LIMITS.password.min} caracteres.`,
    )
    .max(
      FIELD_LIMITS.password.max,
      `La contraseña no puede superar ${FIELD_LIMITS.password.max} caracteres.`,
    )
}

export function personNameField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Escribe tus ${label}.`)
    .min(
      FIELD_LIMITS.personName.min,
      `Tus ${label} deben tener al menos ${FIELD_LIMITS.personName.min} caracteres.`,
    )
    .max(
      FIELD_LIMITS.personName.max,
      `Tus ${label} no pueden superar ${FIELD_LIMITS.personName.max} caracteres.`,
    )
}

export function textField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Escribe ${label}.`)
    .min(min, `Debe tener al menos ${min} caracteres.`)
    .max(max, `No puede superar ${max} caracteres.`)
}

export function requiredChoice(message: string) {
  return z.string().min(1, message)
}

export function integerField(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Escribe ${label}.`)
    .regex(/^\d+$/, 'Escribe un número entero.')
    .refine((value) => Number(value) >= min && Number(value) <= max, {
      message: `Debe estar entre ${min} y ${max}.`,
    })
}

export function apiDateField(requiredMessage: string) {
  return z
    .string()
    .min(1, requiredMessage)
    .regex(API_DATE_PATTERN, 'Usa el formato AAAA-MM-DD.')
    .refine(isValidApiDate, 'Esa fecha no existe. Revísala.')
}

export const birthDateField = apiDateField('Indica tu fecha de nacimiento.')
  .refine((value) => value <= todayApiDate(), 'La fecha de nacimiento no puede ser futura.')
  .refine(
    (value) => Number(value.slice(0, 4)) >= FIELD_LIMITS.oldestBirthYear,
    'Revisa el año de nacimiento.',
  )

export const optionalApiDateField = z.union([z.literal(''), apiDateField('Indica la fecha.')])
