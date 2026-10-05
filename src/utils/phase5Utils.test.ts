import { describe, expect, it } from 'vitest'
import { athleteTabsForRole } from '@/constants/athleteProfile'
import { hasPermission } from '@/constants/permissions'
import type { AcwrSeriesPoint, TechnicalEvaluation } from '@/types/athlete'
import type { User } from '@/types/user'
import { buildAthleteDirectory, filterAthleteDirectory } from '@/utils/athleteDirectory'
import { buildHeatmapWeeks } from '@/utils/loadHeatmap'
import { summarizeIndicators } from '@/utils/technicalScores'
import { withNumbers } from '@/utils/toNumber'

function athlete(id: number, name: string, lastname: string): User {
  return {
    id_user: id,
    id_role: 3,
    name,
    lastname,
    email: `${id}@club.com`,
    birth_date: '2011-05-05',
    role_name: 'DEPORTISTA',
  }
}

describe('directorio de deportistas', () => {
  const athletes = [
    athlete(1, 'Ana', 'Ruiz'),
    athlete(2, 'José', 'Álvarez'),
    athlete(3, 'Luis', 'Mora'),
  ]
  const directory = buildAthleteDirectory(athletes, [
    { id_ath_cat: 10, id_user: 1, id_category: 4, category_name: 'Sub-15', position: 'Portero' },
    { id_ath_cat: 11, id_user: 2, id_category: 5, category_name: 'Sub-17', position: null },
  ])

  it('ordena por apellido y une la categoría de la temporada', () => {
    expect(directory.map((entry) => entry.lastname)).toEqual(['Álvarez', 'Mora', 'Ruiz'])
    expect(directory.find((entry) => entry.id_user === 1)?.category_name).toBe('Sub-15')
    expect(directory.find((entry) => entry.id_user === 3)?.id_category).toBeNull()
  })

  it('filtra por categoría, por nombre sin tildes y por deportistas sin categoría', () => {
    expect(
      filterAthleteDirectory(directory, { search: '', idCategory: 4, onlyUnassigned: false }).map(
        (entry) => entry.id_user,
      ),
    ).toEqual([1])
    expect(
      filterAthleteDirectory(directory, {
        search: 'jose alvarez',
        idCategory: null,
        onlyUnassigned: false,
      }),
    ).toHaveLength(1)
    expect(
      filterAthleteDirectory(directory, { search: '', idCategory: 4, onlyUnassigned: true }).map(
        (entry) => entry.id_user,
      ),
    ).toEqual([3])
  })
})

describe('indicadores técnicos', () => {
  const evaluation = (indicator: string, score: number, date: string): TechnicalEvaluation => ({
    id_eval_tech: Math.random(),
    id_user: 1,
    id_season: 1,
    indicator,
    score,
    evaluator_id: 2,
    eval_date: date,
  })

  it('toma el último puntaje de cada indicador y el anterior para la tendencia', () => {
    const summary = summarizeIndicators([
      evaluation('Pase corto', 6, '2026-02-01'),
      evaluation('Pase corto', 7.5, '2026-05-01'),
      evaluation('Regate', 8, '2026-03-01'),
    ])
    expect(summary).toEqual([
      expect.objectContaining({ indicator: 'Pase corto', latest: 7.5, previous: 6, count: 2 }),
      expect.objectContaining({ indicator: 'Regate', latest: 8, previous: null, count: 1 }),
    ])
  })
})

describe('mapa de calor de carga', () => {
  const point = (date: string, load: number): AcwrSeriesPoint => ({
    date,
    daily_load: load,
    sessions: load > 0 ? 1 : 0,
    acute_load: 0,
    chronic_load: 0,
    acwr: null,
    level: null,
  })

  it('arma 8 semanas de lunes a domingo y escala la intensidad', () => {
    const weeks = buildHeatmapWeeks([point('2026-09-28', 400), point('2026-09-30', 100)])
    expect(weeks).toHaveLength(8)
    expect(weeks[7][0]).toEqual({ date: '2026-09-28', load: 400, step: 4 })
    expect(weeks[7][2]).toEqual({ date: '2026-09-30', load: 100, step: 1 })
    expect(weeks[7][1].step).toBe(0)
  })
})

describe('normalización y permisos', () => {
  it('convierte decimales que llegan como texto', () => {
    expect(
      withNumbers({ height_cm: '165.50', weight_kg: null }, ['height_cm', 'weight_kg']),
    ).toEqual({
      height_cm: 165.5,
      weight_kg: null,
    })
  })

  it('muestra a cada rol solo las pestañas de la ficha que puede consultar', () => {
    expect(athleteTabsForRole('ENCARGADO_SALUD')).toEqual(['carga', 'salud'])
    expect(athleteTabsForRole('DEPORTISTA')).toEqual([
      'fisico',
      'tecnico',
      'carga',
      'objetivos',
      'evolucion',
    ])
    expect(athleteTabsForRole('DIRECTOR_TECNICO')).not.toContain('salud')
    expect(athleteTabsForRole('ENTRENADOR')).toHaveLength(7)
  })

  it('solo administrador y director técnico gestionan temporadas', () => {
    expect(hasPermission('DIRECTOR_TECNICO', 'manageSeasons')).toBe(true)
    expect(hasPermission('ENTRENADOR', 'manageSeasons')).toBe(false)
    expect(hasPermission('ENTRENADOR', 'manageClub')).toBe(true)
    expect(hasPermission('ENCARGADO_SALUD', 'manageClub')).toBe(false)
  })
})
