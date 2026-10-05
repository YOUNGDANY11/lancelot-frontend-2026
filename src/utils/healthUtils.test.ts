import { describe, expect, it } from 'vitest'
import { injurySchema, toInjuryRequest, type InjuryFormValues } from '@/schemas/healthSchemas'
import type { FatigueAlert, InjuryRiskAssessment } from '@/types/club'
import { buildInbox, countByLevel, filterInbox } from '@/utils/alertInbox'

const ALERTS: FatigueAlert[] = [
  {
    id_alert: 1,
    id_user: 7,
    athlete_name: 'Ana Pérez',
    date: '2026-10-03',
    acute_load: 520,
    chronic_load: 340,
    acwr_value: 1.53,
    rpe_avg: 7.2,
    level: 'medio',
    status: 'open',
  },
  {
    id_alert: 2,
    id_user: 8,
    athlete_name: 'Bruno Díaz',
    date: '2026-10-04',
    acute_load: 300,
    chronic_load: 290,
    acwr_value: 1.03,
    rpe_avg: 5,
    level: 'bajo',
    status: 'open',
  },
]

const ASSESSMENTS: InjuryRiskAssessment[] = [
  {
    id_assessment: 9,
    id_user: 8,
    athlete_name: 'Bruno Díaz',
    assessment_date: '2026-10-01',
    risk_level: 'alto',
    status: 'open',
    acwr_value: 1.71,
    method: 'rules',
    triggered_rules: ['acwr_sostenido', 'recaida'],
    details: 'ACWR alto tres días seguidos',
  },
]

describe('bandeja de alertas', () => {
  it('une fatiga y riesgo y ordena por nivel y luego por fecha', () => {
    const inbox = buildInbox(ALERTS, ASSESSMENTS)
    expect(inbox.map((item) => item.key)).toEqual(['risk-9', 'fatigue-1', 'fatigue-2'])
    expect(inbox[0]).toMatchObject({
      kind: 'risk',
      level: 'alto',
      acwr: 1.71,
      rules: ['acwr_sostenido', 'recaida'],
    })
    expect(inbox[1]).toMatchObject({ acuteLoad: 520, chronicLoad: 340, rpeAvg: 7.2 })
  })

  it('filtra por tipo y nivel y cuenta por nivel', () => {
    const inbox = buildInbox(ALERTS, ASSESSMENTS)
    expect(filterInbox(inbox, 'fatigue', 'all')).toHaveLength(2)
    expect(filterInbox(inbox, 'all', 'alto').map((item) => item.id)).toEqual([9])
    expect(countByLevel(inbox)).toEqual({ alto: 1, medio: 1, bajo: 1 })
  })
})

const VALID_INJURY: InjuryFormValues = {
  id_user: 7,
  injury_date: '2026-09-20',
  body_part: 'Tobillo',
  severity: 'moderada',
  mechanism: 'sin_contacto',
  status: 'recovering',
  diagnosis: '',
  recovery_date: '',
  time_loss_days: '',
}

describe('formulario de lesión', () => {
  it('exige el mecanismo y que la recuperación no sea antes de la lesión', () => {
    const missing = injurySchema.safeParse({ ...VALID_INJURY, mechanism: '' })
    expect(missing.error?.issues[0]?.message).toBe('Indica si la lesión fue con o sin contacto.')

    const backwards = injurySchema.safeParse({ ...VALID_INJURY, recovery_date: '2026-09-01' })
    expect(backwards.error?.issues[0]).toMatchObject({
      path: ['recovery_date'],
      message: 'La recuperación no puede ser antes de la lesión.',
    })
  })

  it('omite los días de baja para que el backend los calcule con la recuperación', () => {
    const created = toInjuryRequest({ ...VALID_INJURY, recovery_date: '2026-10-01' }, false)
    expect(created).toEqual({
      id_user: 7,
      injury_date: '2026-09-20',
      body_part: 'Tobillo',
      severity: 'moderada',
      mechanism: 'sin_contacto',
      status: 'recovering',
      recovery_date: '2026-10-01',
    })

    const edited = toInjuryRequest({ ...VALID_INJURY, recovery_date: '2026-10-01' }, true)
    expect(edited).not.toHaveProperty('time_loss_days')
    expect(edited).not.toHaveProperty('id_user')
    expect(edited).toMatchObject({ diagnosis: null, recovery_date: '2026-10-01' })

    expect(toInjuryRequest({ ...VALID_INJURY, time_loss_days: '12' }, true)).toMatchObject({
      recovery_date: null,
      time_loss_days: 12,
    })
  })
})
