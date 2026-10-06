import { describe, expect, it } from 'vitest'
import { CONFIG_DEFINITIONS } from '@/constants/configFields'
import { changedValues, parseConfigDraft, toDraft } from '@/utils/configForm'

const ACWR = CONFIG_DEFINITIONS.acwr
const TALENT = CONFIG_DEFINITIONS.talent

describe('formulario de configuración por alcance', () => {
  it('acepta coma decimal y envía solo lo que cambió', () => {
    const original = { low_min: 0.8, low_max: 1.3, medium_max: 1.5 }
    const parsed = parseConfigDraft(ACWR, { ...toDraft(ACWR, original), low_max: '1,25' })
    expect(parsed.isValid).toBe(true)
    expect(changedValues(original, parsed.values)).toEqual({ low_max: 1.25 })
  })

  it('valida el orden de los umbrales de ACWR', () => {
    const parsed = parseConfigDraft(ACWR, { low_min: '0.8', low_max: '1.6', medium_max: '1.5' })
    expect(parsed.ruleErrors).toEqual([ACWR.rules[0].message])
  })

  it('valida rangos, enteros y decimales por campo', () => {
    const parsed = parseConfigDraft(TALENT, {
      ...toDraft(TALENT, {
        min_percentile: 80,
        min_dimension_score: 40,
        min_improvement_delta: 5,
        min_participation_score: 50,
        exclude_severe_injury: true,
        min_supporting_criteria: 1,
        near_max_age_months: 12,
      }),
      min_percentile: '120',
      min_supporting_criteria: '1.5',
    })
    expect(parsed.fieldErrors).toEqual({
      min_percentile: 'Debe estar entre 0 y 100.',
      min_supporting_criteria: 'Escribe un número entero.',
    })
    expect(parsed.isValid).toBe(false)
  })

  it('exige que la participación mínima no sea menor que el piso de las dimensiones', () => {
    const parsed = parseConfigDraft(TALENT, {
      min_percentile: '80',
      min_dimension_score: '60',
      min_improvement_delta: '5',
      min_participation_score: '50',
      exclude_severe_injury: false,
      min_supporting_criteria: '1',
      near_max_age_months: '12',
    })
    expect(parsed.ruleErrors).toEqual([TALENT.rules[0].message])
    expect(parsed.values.exclude_severe_injury).toBe(false)
  })
})
