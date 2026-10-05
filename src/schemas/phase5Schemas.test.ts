import { describe, expect, it } from 'vitest'
import {
  objectiveSchema,
  physicalEvaluationSchema,
  toPhysicalEvaluationRequest,
} from '@/schemas/athleteSchemas'
import { competencySchema, matchSchema, toCompetencyRequest } from '@/schemas/clubSchemas'

describe('competencias y partidos', () => {
  it('envía la fecha de fin en el campo finish que espera el backend', () => {
    const values = competencySchema.parse({
      name: 'Liga departamental',
      description: '',
      id_category: '4',
      start_date: '2026-03-01',
      finish: '2026-10-30',
    })
    expect(toCompetencyRequest(values, 2)).toEqual({
      name: 'Liga departamental',
      id_category: 4,
      start_date: '2026-03-01',
      finish: '2026-10-30',
      id_season: 2,
    })
  })

  it('rechaza una fecha de fin anterior al inicio', () => {
    const result = competencySchema.safeParse({
      name: 'Torneo',
      description: '',
      id_category: '4',
      start_date: '2026-03-01',
      finish: '2026-02-01',
    })
    expect(result.error?.issues[0].message).toBe(
      'La fecha de fin no puede ser anterior a la de inicio.',
    )
  })

  it('exige la hora del partido en formato HH:MM', () => {
    const base = { id_competency: '1', date: '2026-04-04', location: 'Estadio municipal' }
    expect(matchSchema.safeParse({ ...base, time: '15:30' }).success).toBe(true)
    expect(matchSchema.safeParse({ ...base, time: '25:00' }).success).toBe(false)
  })
})

describe('evaluaciones', () => {
  it('acepta decimales con coma y omite los campos opcionales vacíos', () => {
    const values = physicalEvaluationSchema.parse({
      stage: 'pre',
      eval_date: '2026-02-10',
      height_cm: '165,5',
      weight_kg: '58',
      vo2max_estimado: '',
      test_method: '',
      speed_20m: '3,45',
    })
    expect(toPhysicalEvaluationRequest(values, { idUser: 7, idSeason: 2, evaluatorId: 3 })).toEqual(
      {
        id_user: 7,
        id_season: 2,
        stage: 'pre',
        eval_date: '2026-02-10',
        height_cm: 165.5,
        weight_kg: 58,
        speed_20m: 3.45,
        evaluator_id: 3,
      },
    )
  })

  it('valida rangos realistas', () => {
    const result = physicalEvaluationSchema.safeParse({
      stage: 'pre',
      eval_date: '2026-02-10',
      height_cm: '500',
      weight_kg: '58',
      vo2max_estimado: '',
      test_method: '',
      speed_20m: '',
    })
    expect(result.error?.issues[0].message).toBe('Debe estar entre 50 y 250.')
  })

  it('exige un objetivo con descripción y fecha meta', () => {
    const result = objectiveSchema.safeParse({
      description: 'Mejorar',
      target_date: '',
      status: 'open',
    })
    expect(result.success).toBe(false)
  })
})
