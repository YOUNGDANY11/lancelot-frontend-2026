import { describe, expect, it } from 'vitest'
import type { PlannedAthlete } from '@/types/talent'
import {
  buildApplyPayload,
  countApplicable,
  defaultDecision,
  resolveDecision,
} from '@/utils/nextCyclePlan'

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
    default_decision: { include: true, id_category: 2, promote: false, carry: false },
    ...overrides,
  }
}

describe('plan del siguiente ciclo', () => {
  it('usa la decisión sugerida por el backend y le aplica los cambios', () => {
    expect(defaultDecision(athlete())).toEqual({
      include: true,
      idCategory: 2,
      promote: false,
      carry: false,
    })
    expect(resolveDecision(athlete(), { idCategory: 3 })).toMatchObject({ idCategory: 3 })
  })

  it('ajusta el total del backend solo con los deportistas que cambiaron', () => {
    const excluded = { athlete: athlete(), patch: { include: false } }
    const added = {
      athlete: athlete({
        id_user: 8,
        default_decision: { include: false, id_category: 2, promote: false, carry: false },
      }),
      patch: { include: true },
    }
    const unchanged = { athlete: athlete({ id_user: 9 }), patch: { carry: true } }

    expect(countApplicable(10, [excluded])).toBe(9)
    expect(countApplicable(10, [excluded, added, unchanged])).toBe(10)
  })

  it('envía solo los cambios del cuerpo técnico', () => {
    expect(
      buildApplyPayload(4, [
        { athlete: athlete(), patch: { idCategory: 3 } },
        {
          athlete: athlete({
            id_user: 8,
            default_decision: { include: false, id_category: null, promote: false, carry: false },
          }),
          patch: { include: true },
        },
      ]),
    ).toEqual({
      id_target_season: 4,
      overrides: [
        { id_user: 7, include: true, id_category: 3, promote: false, carry: false },
        { id_user: 8, include: true, promote: false, carry: false },
      ],
    })
  })
})
