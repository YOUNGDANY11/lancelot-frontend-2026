import { describe, expect, it } from 'vitest'
import type { RankedIndex } from '@/types/talent'
import { athletesWithoutIndex, baseAssignmentByUser, buildRanking } from '@/utils/talentRanking'

const MAX_AGE = new Map([
  [3, 15],
  [4, 17],
])

const ASSIGNMENTS = [
  {
    id_ath_cat: 1,
    id_user: 7,
    id_category: 4,
    category_name: 'Sub-17',
    name: 'Ana',
    lastname: 'Pérez',
  },
  {
    id_ath_cat: 2,
    id_user: 7,
    id_category: 3,
    category_name: 'Sub-15',
    name: 'Ana',
    lastname: 'Pérez',
    position: 'Portero',
  },
  {
    id_ath_cat: 3,
    id_user: 8,
    id_category: 3,
    category_name: 'Sub-15',
    name: 'Bruno',
    lastname: 'Díaz',
  },
  {
    id_ath_cat: 4,
    id_user: 9,
    id_category: 4,
    category_name: 'Sub-17',
    name: 'Carla',
    lastname: 'Mora',
  },
  {
    id_ath_cat: 5,
    id_user: 10,
    id_category: 3,
    category_name: 'Sub-15',
    name: 'Dana',
    lastname: 'Ruiz',
  },
]

function index(id_user: number, value: number): RankedIndex {
  return {
    id_index: id_user * 10,
    id_user,
    id_season: 2,
    physical_score: value,
    technical_score: value,
    participation_score: value,
    index_value: value,
  }
}

describe('ranking del índice de progreso', () => {
  const baseByUser = baseAssignmentByUser(ASSIGNMENTS, MAX_AGE)
  const indices = [index(7, 71.5), index(8, 80.2), index(9, 64)]

  it('ubica a cada deportista en su categoría de edad aunque juegue en varias', () => {
    expect(baseByUser.get(7)).toMatchObject({ id_category: 3, position: 'Portero' })
  })

  it('ordena de mayor a menor dentro de la categoría', () => {
    expect(
      buildRanking(indices, baseByUser, 3).map((entry) => [entry.rank, entry.athleteName]),
    ).toEqual([
      [1, 'Bruno Díaz'],
      [2, 'Ana Pérez'],
    ])
    expect(buildRanking(indices, baseByUser, null)).toHaveLength(3)
  })

  it('lista a quienes aún no tienen índice', () => {
    expect(athletesWithoutIndex(baseByUser, indices, 3).map((item) => item.id_user)).toEqual([10])
  })
})
