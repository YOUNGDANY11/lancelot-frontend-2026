import { z } from 'zod'
import { apiDateField, requiredChoice, textField } from '@/schemas/fields'
import type { CreateParentalConsentRequest } from '@/types/club'
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
  status: z.enum(['pending', 'granted']),
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
