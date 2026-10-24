import { describe, expect, it } from 'vitest'
import { baseAssignmentByUser } from '@/utils/talentRanking'

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

describe('categoría base del ranking', () => {
  const baseByUser = baseAssignmentByUser(ASSIGNMENTS, MAX_AGE)

  it('ubica a cada deportista en su categoría de edad aunque juegue en varias', () => {
    expect(baseByUser.get(7)).toMatchObject({ id_category: 3, position: 'Portero' })
  })
})
