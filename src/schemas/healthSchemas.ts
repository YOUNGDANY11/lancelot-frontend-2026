import { z } from 'zod'
import {
  apiDateField,
  integerField,
  optionalApiDateField,
  requiredChoice,
  textField,
} from '@/schemas/fields'
import type { CreateParentalConsentRequest, UpdateParentalConsentRequest } from '@/types/club'
import type { HealthRecordRequest, InjuryRequest } from '@/types/health'
import { todayApiDate } from '@/utils/formatDate'

export const GUARDIAN_RELATIONSHIPS = [
  'Madre',
  'Padre',
  'Abuela',
  'Abuelo',
  'Tía',
  'Tío',
  'Hermana mayor',
  'Hermano mayor',
  'Tutor legal',
] as const

export const parentalConsentSchema = z.object({
  id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
  guardian_name: textField('el nombre del acudiente', 2, 150),
  guardian_document: textField('el documento del acudiente', 3, 30),
  guardian_relationship: requiredChoice('Elige el parentesco.'),
  signed_at: apiDateField('Indica la fecha de firma.').refine(
    (value) => value <= todayApiDate(),
    'La fecha de firma no puede ser futura.',
  ),
  document_url: z.union([
    z.literal(''),
    z.url('Escribe un enlace válido, por ejemplo https://drive.google.com/…').max(255),
  ]),
  status: z.enum(['pending', 'granted', 'revoked']),
})

export type ParentalConsentFormValues = z.infer<typeof parentalConsentSchema>

export function toCreateParentalConsentRequest(
  values: ParentalConsentFormValues,
): CreateParentalConsentRequest {
  return {
    id_user: values.id_user,
    guardian_name: values.guardian_name,
    guardian_document: values.guardian_document,
    guardian_relationship: values.guardian_relationship,
    signed_at: values.signed_at,
    status: values.status,
    ...(values.document_url ? { document_url: values.document_url } : {}),
  }
}

export function toUpdateParentalConsentRequest(
  values: ParentalConsentFormValues,
): UpdateParentalConsentRequest {
  return {
    guardian_name: values.guardian_name,
    guardian_document: values.guardian_document,
    guardian_relationship: values.guardian_relationship,
    signed_at: values.signed_at,
    status: values.status,
    document_url: values.document_url || null,
  }
}

export const injurySchema = z
  .object({
    id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
    injury_date: apiDateField('Indica la fecha de la lesión.').refine(
      (value) => value <= todayApiDate(),
      'La fecha de la lesión no puede ser futura.',
    ),
    body_part: textField('la zona del cuerpo', 2, 50),
    severity: z.enum(['leve', 'moderada', 'severa'], { error: 'Elige la severidad.' }),
    mechanism: z.enum(['contacto', 'sin_contacto'], {
      error: 'Indica si la lesión fue con o sin contacto.',
    }),
    status: z.enum(['active', 'recovering', 'recovered'], { error: 'Elige el estado.' }),
    diagnosis: z.string().trim().max(1000, 'No puede superar 1000 caracteres.'),
    recovery_date: optionalApiDateField,
    time_loss_days: z.union([z.literal(''), integerField('los días de baja', 0, 1000)]),
  })
  .refine((values) => !values.recovery_date || values.recovery_date >= values.injury_date, {
    path: ['recovery_date'],
    message: 'La recuperación no puede ser antes de la lesión.',
  })

export type InjuryFormValues = z.infer<typeof injurySchema>

export function toInjuryRequest(values: InjuryFormValues, isEditing: boolean): InjuryRequest {
  const timeLoss = values.time_loss_days === '' ? null : Number(values.time_loss_days)
  const request: InjuryRequest = {
    injury_date: values.injury_date,
    body_part: values.body_part.trim(),
    severity: values.severity,
    mechanism: values.mechanism,
    status: values.status,
  }
  if (isEditing) {
    return {
      ...request,
      diagnosis: values.diagnosis.trim() || null,
      recovery_date: values.recovery_date || null,
      ...(timeLoss !== null || !values.recovery_date ? { time_loss_days: timeLoss } : {}),
    }
  }
  return {
    ...request,
    id_user: values.id_user,
    ...(values.diagnosis.trim() ? { diagnosis: values.diagnosis.trim() } : {}),
    ...(values.recovery_date ? { recovery_date: values.recovery_date } : {}),
    ...(timeLoss !== null ? { time_loss_days: timeLoss } : {}),
  }
}

export const healthRecordSchema = z.object({
  id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
  condition_type: textField('el tipo de condición', 2, 60),
  description: textField('la descripción', 3, 2000),
  restriction: z.boolean(),
  status: z.enum(['active', 'resolved'], { error: 'Elige el estado.' }),
})

export type HealthRecordFormValues = z.infer<typeof healthRecordSchema>

export function toHealthRecordRequest(values: HealthRecordFormValues): HealthRecordRequest {
  return {
    condition_type: values.condition_type.trim(),
    description: values.description.trim(),
    restriction: values.restriction,
    status: values.status,
  }
}
