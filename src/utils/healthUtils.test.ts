import { describe, expect, it } from 'vitest'
import { injurySchema, toInjuryRequest, type InjuryFormValues } from '@/schemas/healthSchemas'
import { mapInboxItem, type ApiInboxItem } from '@/services/healthService'

const API_ITEMS: ApiInboxItem[] = [
  {
    kind: 'risk',
    id: 9,
    id_user: 8,
    athlete_name: 'Bruno Díaz',
    date: '2026-10-01',
    level: 'alto',
    acwr_value: 1.71,
    acute_load: null,
    chronic_load: null,
    rpe_avg: null,
    triggered_rules: ['acwr_sostenido', 'recaida', ''],
    details: 'ACWR alto tres días seguidos',
    method: 'rules',
  },
  {
    kind: 'fatigue',
    id: 1,
    id_user: 7,
    athlete_name: '',
    date: '2026-10-03T00:00:00.000Z',
    level: 'medio',
    acwr_value: 1.53,
    acute_load: 520,
    chronic_load: 340,
    rpe_avg: 7.2,
    triggered_rules: [],
    details: null,
    method: null,
  },
]

describe('bandeja de alertas', () => {
  it('convierte cada alerta del backend en un elemento de la bandeja', () => {
    const [risk, fatigue] = API_ITEMS.map(mapInboxItem)
    expect(risk).toMatchObject({
      key: 'risk-9',
      kind: 'risk',
      athleteName: 'Bruno Díaz',
      level: 'alto',
      acwr: 1.71,
      rules: ['acwr_sostenido', 'recaida'],
      method: 'rules',
    })
    expect(fatigue).toMatchObject({
      key: 'fatigue-1',
      athleteName: 'Deportista sin nombre',
      date: '2026-10-03',
      acuteLoad: 520,
      chronicLoad: 340,
      rpeAvg: 7.2,
      rules: [],
    })
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
