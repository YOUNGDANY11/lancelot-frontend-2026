import { describe, expect, it } from 'vitest'
import type { PlannedAthlete } from '@/types/talent'
import { buildApplyPayload, defaultDecision, resolveDecision } from '@/utils/nextCyclePlan'

function athlete(overrides: Partial<PlannedAthlete> = {}): PlannedAthlete {
  return {
    id_user: 7,
    name: 'Ana',
    lastname: 'Ruiz',
    position: 'Delantero',
    current_category: { id_category: 1, name: 'Sub-13' },
    sporting_age: 14,
    suggested_category: { id_category: 2, name: 'Sub-15' },
    suggestion_reason: 'Pasa a Sub-15 por edad: cumple 14 años en 2027',
    promotion_category: null,
    promotion_reason: null,
    eligible_category_ids: [2, 3],
    index_value: 61,
    focus_dimension: 'tactica',
    focus_score: 40,
    open_objectives: [],
    planned_categories: [],
    ...overrides,
  }
}

describe('plan del siguiente ciclo', () => {
  it('incluye por defecto a quien tiene categoría propuesta y aún no está asignado', () => {
    expect(defaultDecision(athlete())).toEqual({
      include: true,
      idCategory: 2,
      promote: false,
      carry: false,
    })
    expect(defaultDecision(athlete({ planned_categories: ['Sub-15'] })).include).toBe(false)
    expect(defaultDecision(athlete({ suggested_category: null })).include).toBe(false)
  })

  it('propone el ascenso y llevar los objetivos cuando existen', () => {
    const decision = defaultDecision(
      athlete({
        promotion_category: { id_category: 3, name: 'Sub-17' },
        open_objectives: [
          { id_objective: 1, description: 'Bajar a 3,3 s', target_date: '2026-11-30' },
        ],
      }),
    )
    expect(decision).toMatchObject({ promote: true, carry: true })
  })

  it('arma el envío solo con los deportistas incluidos y respeta los cambios del cuerpo técnico', () => {
    const promoted = athlete({
      id_user: 8,
      promotion_category: { id_category: 3, name: 'Sub-17' },
      open_objectives: [
        { id_objective: 1, description: 'Bajar a 3,3 s', target_date: '2026-11-30' },
      ],
    })
    const rows = [
      { athlete: athlete(), decision: resolveDecision(athlete(), { idCategory: 3 }) },
      { athlete: promoted, decision: resolveDecision(promoted, { carry: false }) },
      {
        athlete: athlete({ id_user: 9 }),
        decision: resolveDecision(athlete(), { include: false }),
      },
    ]
    expect(buildApplyPayload(4, rows)).toEqual({
      id_target_season: 4,
      athletes: [
        { id_user: 7, id_category: 3, id_promotion_category: null, carry_objectives: false },
        { id_user: 8, id_category: 2, id_promotion_category: 3, carry_objectives: false },
      ],
    })
  })
})
