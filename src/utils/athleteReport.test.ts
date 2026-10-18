import { describe, expect, it } from 'vitest'
import type { EvaluationDimension } from '@/constants/enums'
import type { TechnicalEvaluation } from '@/types/athlete'
import { averageByIndicator, countLevels, inSeason } from '@/utils/athleteReport'

function technical(
  indicator: string,
  score: number,
  eval_date: string,
  id_season = 2,
  dimension: EvaluationDimension = 'tecnica',
) {
  return {
    id_eval_tech: score,
    id_user: 7,
    id_season,
    dimension,
    indicator,
    score,
    evaluator_id: 1,
    eval_date,
  } satisfies TechnicalEvaluation
}

describe('informe de evolución', () => {
  it('promedia cada indicador técnico y conserva la fecha más reciente', () => {
    expect(
      averageByIndicator([
        technical('Remate', 6, '2026-02-01'),
        technical('Pase corto ', 7, '2026-03-01'),
        technical('Pase corto', 8, '2026-05-01'),
      ]),
    ).toEqual([
      {
        dimension: 'tecnica',
        indicator: 'Pase corto',
        average: 7.5,
        count: 2,
        lastDate: '2026-05-01',
      },
      { dimension: 'tecnica', indicator: 'Remate', average: 6, count: 1, lastDate: '2026-02-01' },
    ])
  })

  it('separa los promedios técnicos de los tácticos', () => {
    expect(
      averageByIndicator([
        technical('Desmarque', 6, '2026-02-01', 2, 'tactica'),
        technical('Desmarque', 8, '2026-03-01', 2, 'tactica'),
        technical('Regate', 9, '2026-03-01'),
      ]).map(({ dimension, indicator, average }) => [dimension, indicator, average]),
    ).toEqual([
      ['tactica', 'Desmarque', 7],
      ['tecnica', 'Regate', 9],
    ])
  })

  it('cuenta las alertas por nivel y filtra por temporada', () => {
    expect(countLevels(['alto', 'medio', 'alto'])).toEqual({ alto: 2, medio: 1, bajo: 0 })
    expect(
      inSeason([technical('Remate', 6, '2026-02-01', 1), technical('Remate', 7, '2026-03-01')], 2),
    ).toHaveLength(1)
  })
})
