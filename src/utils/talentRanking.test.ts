import { describe, expect, it } from 'vitest'
import type { RankedIndex } from '@/types/talent'
import {
  athletesWithoutIndex,
  baseAssignmentBySport,
  baseAssignmentByUser,
  buildRanking,
} from '@/utils/talentRanking'

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

const SPORTS = new Map([
  [3, 'futbol' as const],
  [4, 'futbol' as const],
])

describe('ranking del índice de progreso', () => {
  const baseByUser = baseAssignmentBySport(ASSIGNMENTS, MAX_AGE, SPORTS)
  const indices = [index(7, 71.5), index(8, 80.2), index(9, 64)]

  it('ubica a cada deportista en su categoría de edad aunque juegue en varias', () => {
    expect(baseAssignmentByUser(ASSIGNMENTS, MAX_AGE).get(7)).toMatchObject({
      id_category: 3,
      position: 'Portero',
    })
    expect(baseByUser.get('7|futbol')).toMatchObject({ id_category: 3, position: 'Portero' })
  })

  it('lista a quien juega ambos deportes una vez por deporte', () => {
    const futsal = {
      id_ath_cat: 6,
      id_user: 7,
      id_category: 5,
      category_name: 'Sala Sub-17',
      name: 'Ana',
      lastname: 'Pérez',
      position: 'Ala',
    }
    const bySport = baseAssignmentBySport(
      [...ASSIGNMENTS, futsal],
      new Map([...MAX_AGE, [5, 17]]),
      new Map([...SPORTS, [5, 'futbol_sala' as const]]),
    )
    const ranking = buildRanking(
      [index(7, 71.5), { ...index(7, 66), id_index: 71, sport: 'futbol_sala' }],
      bySport,
      null,
    )
    expect(
      ranking.map((entry) => [entry.athleteName, entry.category_name, entry.position]),
    ).toEqual([
      ['Ana Pérez (Fútbol)', 'Sub-15', 'Portero'],
      ['Ana Pérez (Fútbol sala)', 'Sala Sub-17', 'Ala'],
    ])
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
