import type { RiskLevelValue } from '@/constants/enums'
import type { TechnicalEvaluation } from '@/types/athlete'

export interface TechnicalAverage {
  indicator: string
  average: number
  count: number
  lastDate: string
}

export function averageByIndicator(evaluations: TechnicalEvaluation[]): TechnicalAverage[] {
  const groups = new Map<string, TechnicalEvaluation[]>()
  for (const evaluation of evaluations) {
    const key = evaluation.indicator.trim()
    groups.set(key, [...(groups.get(key) ?? []), evaluation])
  }
  return [...groups.entries()]
    .map(([indicator, items]) => ({
      indicator,
      average: items.reduce((sum, item) => sum + item.score, 0) / items.length,
      count: items.length,
      lastDate: items.map((item) => item.eval_date).sort((a, b) => b.localeCompare(a))[0],
    }))
    .sort((first, second) => first.indicator.localeCompare(second.indicator, 'es'))
}

export function countLevels(levels: RiskLevelValue[]): Record<RiskLevelValue, number> {
  const counts: Record<RiskLevelValue, number> = { alto: 0, medio: 0, bajo: 0 }
  for (const level of levels) counts[level] += 1
  return counts
}

export function inSeason<T extends { id_season: number }>(items: T[], idSeason: number): T[] {
  return items.filter((item) => item.id_season === idSeason)
}
