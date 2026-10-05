import { z } from 'zod'
import { ALL_POSITIONS } from '@/constants/positions'
import {
  apiDateField,
  integerField,
  optionalApiDateField,
  requiredChoice,
  textField,
} from '@/schemas/fields'
import type {
  CreateAthleteAssignmentRequest,
  CreateCategoryRequest,
  CreateSeasonRequest,
} from '@/types/club'

export const seasonSchema = z
  .object({
    name: textField('el nombre de la temporada', 1, 50),
    start_date: apiDateField('Indica la fecha de inicio.'),
    end_date: optionalApiDateField,
    activateNow: z.boolean(),
  })
  .refine((values) => !values.end_date || values.end_date >= values.start_date, {
    message: 'La fecha de finalización no puede ser anterior a la de inicio.',
    path: ['end_date'],
  })

export type SeasonFormValues = z.infer<typeof seasonSchema>

export function toCreateSeasonRequest(values: SeasonFormValues): CreateSeasonRequest {
  return {
    name: values.name,
    start_date: values.start_date,
    ...(values.end_date ? { end_date: values.end_date } : {}),
    status: values.activateNow ? 'active' : 'planned',
  }
}

export const activateSeasonSchema = z.object({
  id_season: requiredChoice('Elige la temporada que quieres activar.'),
})

export type ActivateSeasonFormValues = z.infer<typeof activateSeasonSchema>

export const categorySchema = z
  .object({
    name: textField('el nombre de la categoría', 2, 50),
    min_age: integerField('la edad mínima', 3, 60),
    max_age: integerField('la edad máxima', 3, 60),
  })
  .refine((values) => Number(values.min_age) <= Number(values.max_age), {
    message: 'La edad máxima debe ser mayor o igual a la mínima.',
    path: ['max_age'],
  })

export type CategoryFormValues = z.infer<typeof categorySchema>

export function toCreateCategoryRequest(values: CategoryFormValues): CreateCategoryRequest {
  return {
    name: values.name,
    min_age: Number(values.min_age),
    max_age: Number(values.max_age),
  }
}

export const athleteAssignmentSchema = z.object({
  id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
  id_category: requiredChoice('Elige la categoría.'),
  position: z.string().refine((value) => ALL_POSITIONS.includes(value), 'Elige la posición.'),
})

export type AthleteAssignmentFormValues = z.infer<typeof athleteAssignmentSchema>

export function toCreateAthleteAssignmentRequest(
  values: AthleteAssignmentFormValues,
  idSeason: number,
): CreateAthleteAssignmentRequest {
  return {
    id_user: values.id_user,
    id_category: Number(values.id_category),
    id_season: idSeason,
    position: values.position,
  }
}

export const seasonEditSchema = z
  .object({
    name: textField('el nombre de la temporada', 1, 50),
    start_date: apiDateField('Indica la fecha de inicio.'),
    end_date: optionalApiDateField,
    status: z.enum(['planned', 'active', 'closed']),
  })
  .refine((values) => !values.end_date || values.end_date >= values.start_date, {
    message: 'La fecha de finalización no puede ser anterior a la de inicio.',
    path: ['end_date'],
  })

export type SeasonEditFormValues = z.infer<typeof seasonEditSchema>

export function toUpdateSeasonRequest(values: SeasonEditFormValues) {
  return {
    name: values.name,
    start_date: values.start_date,
    status: values.status,
    ...(values.end_date ? { end_date: values.end_date } : {}),
  }
}

export const competencySchema = z
  .object({
    name: textField('el nombre de la competencia', 2, 100),
    description: z.string().trim().max(500, 'No puede superar 500 caracteres.'),
    id_category: requiredChoice('Elige la categoría.'),
    start_date: apiDateField('Indica la fecha de inicio.'),
    finish: optionalApiDateField,
  })
  .refine((values) => !values.finish || values.finish >= values.start_date, {
    message: 'La fecha de fin no puede ser anterior a la de inicio.',
    path: ['finish'],
  })

export type CompetencyFormValues = z.infer<typeof competencySchema>

export function toCompetencyRequest(values: CompetencyFormValues, idSeason: number) {
  return {
    name: values.name,
    id_category: Number(values.id_category),
    start_date: values.start_date,
    id_season: idSeason,
    ...(values.description ? { description: values.description } : {}),
    ...(values.finish ? { finish: values.finish } : {}),
  }
}

export const matchSchema = z.object({
  id_competency: requiredChoice('Elige la competencia.'),
  date: apiDateField('Indica la fecha del partido.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Indica la hora, por ejemplo 15:30.'),
  location: textField('el lugar del partido', 4, 100),
})

export type MatchFormValues = z.infer<typeof matchSchema>

export function toMatchRequest(values: MatchFormValues, idCategory: number) {
  return {
    id_competency: Number(values.id_competency),
    id_category: idCategory,
    date: values.date,
    time: values.time,
    location: values.location,
  }
}

export const callUpSchema = z.object({
  id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
})

export type CallUpFormValues = z.infer<typeof callUpSchema>

export const assignmentChangeSchema = z.object({
  id_category: requiredChoice('Elige la categoría.'),
  position: z.string().refine((value) => ALL_POSITIONS.includes(value), 'Elige la posición.'),
})

export type AssignmentChangeFormValues = z.infer<typeof assignmentChangeSchema>

export const talentFlagSchema = z.object({
  id_user: z.number({ error: 'Elige un deportista.' }).int().positive('Elige un deportista.'),
  criteria: textField('los criterios observados', 10, 1000),
  recommended_action: textField('la acción recomendada', 5, 500),
})

export type TalentFlagFormValues = z.infer<typeof talentFlagSchema>
