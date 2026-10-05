import { describe, expect, it } from 'vitest'
import { buildAthleteDirectory, filterAthleteDirectory } from '@/utils/athleteDirectory'
import {
  checkEligibility,
  eligibleCategories,
  referenceYearOf,
  sortByAgeGroup,
  sportingAge,
} from '@/utils/categoryEligibility'

const CATEGORIES = [
  { id_category: 1, name: 'Sub-12', max_age: 12 },
  { id_category: 2, name: 'Sub-13', max_age: 13 },
  { id_category: 3, name: 'Sub-15', max_age: 15 },
  { id_category: 4, name: 'Sub-17', max_age: 17 },
  { id_category: 5, name: 'Sub-20', max_age: 20 },
]

describe('elegibilidad por edad', () => {
  it('cuenta la edad con el año de nacimiento y el año de la temporada', () => {
    expect(sportingAge('2012-11-30', 2026)).toBe(14)
    expect(referenceYearOf('2026-02-01')).toBe(2026)
  })

  it('permite su categoría y las superiores, nunca las menores', () => {
    expect(
      eligibleCategories('2012-03-15', CATEGORIES, 2026).map((category) => category.name),
    ).toEqual(['Sub-15', 'Sub-17', 'Sub-20'])
    expect(checkEligibility('2012-03-15', CATEGORIES[1], 2026)).toMatchObject({
      eligible: false,
      reason: 'Cumple 14 años en 2026 y Sub-13 es hasta 13 años.',
    })
  })

  it('no habilita categorías sin fecha de nacimiento', () => {
    expect(eligibleCategories(null, CATEGORIES, 2026)).toEqual([])
  })

  it('ordena las asignaciones de la categoría menor a la mayor', () => {
    const maxAge = new Map(CATEGORIES.map((category) => [category.id_category, category.max_age]))
    expect(
      sortByAgeGroup([{ id_category: 5 }, { id_category: 3 }, { id_category: 4 }], maxAge).map(
        (item) => item.id_category,
      ),
    ).toEqual([3, 4, 5])
  })
})

describe('directorio con varias categorías', () => {
  it('muestra todas las categorías y filtra por cualquiera de ellas', () => {
    const maxAge = new Map(CATEGORIES.map((category) => [category.id_category, category.max_age]))
    const directory = buildAthleteDirectory(
      [
        {
          id_user: 7,
          id_role: 3,
          name: 'Juan',
          lastname: 'Pérez',
          email: 'juan@club.com',
          birth_date: '2012-03-15',
          role_name: 'DEPORTISTA',
        },
      ],
      [
        { id_ath_cat: 2, id_user: 7, id_category: 4, category_name: 'Sub-17', position: null },
        { id_ath_cat: 1, id_user: 7, id_category: 3, category_name: 'Sub-15', position: 'Volante' },
      ],
      maxAge,
    )
    expect(directory[0]).toMatchObject({
      id_category: 3,
      category_name: 'Sub-15 · Sub-17',
      category_ids: [3, 4],
      position: 'Volante',
    })
    expect(
      filterAthleteDirectory(directory, { search: '', idCategory: 4, onlyUnassigned: false }),
    ).toHaveLength(1)
  })
})
