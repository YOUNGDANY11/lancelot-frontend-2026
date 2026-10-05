import { z } from 'zod'
import { apiDateField, textField } from '@/schemas/fields'
import type {
  DevelopmentObjectiveRequest,
  PhysicalEvaluationRequest,
  TechnicalEvaluationRequest,
} from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

function decimalField(label: string, min: number, max: number, decimals: number) {
  const pattern = new RegExp(`^\\d+(?:[.,]\\d{1,${decimals}})?$`)
  return z
    .string()
    .trim()
    .min(1, `Escribe ${label}.`)
    .regex(pattern, `Usa un número con máximo ${decimals} decimales.`)
    .refine((value) => {
      const parsed = Number(value.replace(',', '.'))
      return parsed >= min && parsed <= max
    }, `Debe estar entre ${min} y ${max}.`)
}

function optionalDecimalField(label: string, min: number, max: number, decimals: number) {
  return z.union([z.literal(''), decimalField(label, min, max, decimals)])
}

function toDecimal(value: string): number {
  return Number(value.replace(',', '.'))
}

const pastOrTodayDate = (message: string) =>
  apiDateField(message).refine((value) => value <= todayApiDate(), 'La fecha no puede ser futura.')

export const physicalEvaluationSchema = z.object({
  stage: z.enum(['pre', 'mid', 'post'], { error: 'Elige la etapa.' }),
  eval_date: pastOrTodayDate('Indica la fecha de la evaluación.'),
  height_cm: decimalField('la talla', 50, 250, 2),
  weight_kg: decimalField('el peso', 15, 200, 2),
  vo2max_estimado: optionalDecimalField('el VO₂ máx.', 10, 95, 2),
  test_method: z.union([z.literal(''), z.enum(['course_navette', 'cooper', 'otro'])]),
  speed_20m: optionalDecimalField('el tiempo en 20 m', 2, 10, 2),
})

export type PhysicalEvaluationFormValues = z.infer<typeof physicalEvaluationSchema>

export function toPhysicalEvaluationRequest(
  values: PhysicalEvaluationFormValues,
  context: { idUser: number; idSeason: number; evaluatorId?: number },
): PhysicalEvaluationRequest {
  return {
    id_user: context.idUser,
    id_season: context.idSeason,
    stage: values.stage,
    eval_date: values.eval_date,
    height_cm: toDecimal(values.height_cm),
    weight_kg: toDecimal(values.weight_kg),
    ...(values.vo2max_estimado ? { vo2max_estimado: toDecimal(values.vo2max_estimado) } : {}),
    ...(values.test_method ? { test_method: values.test_method } : {}),
    ...(values.speed_20m ? { speed_20m: toDecimal(values.speed_20m) } : {}),
    ...(context.evaluatorId ? { evaluator_id: context.evaluatorId } : {}),
  }
}

export const technicalEvaluationSchema = z.object({
  indicator: textField('el indicador', 1, 60),
  score: decimalField('el puntaje', 1, 10, 1),
  eval_date: pastOrTodayDate('Indica la fecha de la evaluación.'),
})

export type TechnicalEvaluationFormValues = z.infer<typeof technicalEvaluationSchema>

export function toTechnicalEvaluationRequest(
  values: TechnicalEvaluationFormValues,
  context: { idUser: number; idSeason: number; evaluatorId: number },
): TechnicalEvaluationRequest {
  return {
    id_user: context.idUser,
    id_season: context.idSeason,
    evaluator_id: context.evaluatorId,
    indicator: values.indicator,
    score: toDecimal(values.score),
    eval_date: values.eval_date,
  }
}

export const objectiveSchema = z.object({
  description: textField('el objetivo', 5, 500),
  target_date: apiDateField('Indica la fecha meta.'),
  status: z.enum(['open', 'achieved', 'missed'], { error: 'Elige el estado.' }),
})

export type ObjectiveFormValues = z.infer<typeof objectiveSchema>

export function toObjectiveRequest(
  values: ObjectiveFormValues,
  context: { idUser: number; idSeason: number; setBy: number },
): DevelopmentObjectiveRequest {
  return {
    id_user: context.idUser,
    id_season: context.idSeason,
    set_by: context.setBy,
    description: values.description,
    target_date: values.target_date,
    status: values.status,
  }
}
