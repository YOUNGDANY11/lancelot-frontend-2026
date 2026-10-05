import { z } from 'zod'
import { apiDateField, integerField, requiredChoice } from '@/schemas/fields'
import type { TrainingSessionRequest } from '@/types/training'

export const trainingSessionSchema = z.object({
  id_category: requiredChoice('Elige la categoría.'),
  date: apiDateField('Indica la fecha de la sesión.'),
  type: z.enum(['tecnico', 'fisico', 'tactico', 'mixto'], { error: 'Elige el tipo de sesión.' }),
  planned_duration_min: integerField('la duración planificada', 1, 300),
})

export type TrainingSessionFormValues = z.infer<typeof trainingSessionSchema>

export function toTrainingSessionRequest(
  values: TrainingSessionFormValues,
  idSeason: number,
): TrainingSessionRequest {
  return {
    id_category: Number(values.id_category),
    id_season: idSeason,
    date: values.date,
    type: values.type,
    planned_duration_min: Number(values.planned_duration_min),
  }
}
