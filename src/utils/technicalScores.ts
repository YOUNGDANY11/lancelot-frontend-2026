import type { EvaluationDimension } from '@/constants/enums'
import type { TechnicalEvaluation } from '@/types/athlete'

export interface IndicatorSummary {
  dimension: EvaluationDimension
  indicator: string
  latest: number
  previous: number | null
  date: string
  count: number
}

export function summarizeIndicators(evaluations: TechnicalEvaluation[]): IndicatorSummary[] {
  const byIndicator = new Map<string, TechnicalEvaluation[]>()
  for (const evaluation of evaluations) {
    const key = `${evaluation.dimension}|${evaluation.indicator.trim()}`
    byIndicator.set(key, [...(byIndicator.get(key) ?? []), evaluation])
  }
  return [...byIndicator.values()]
    .map((items) => {
      const sorted = [...items].sort((first, second) =>
        first.eval_date.localeCompare(second.eval_date),
      )
      const latest = sorted[sorted.length - 1]
      const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null
      return {
        dimension: latest.dimension,
        indicator: latest.indicator.trim(),
        latest: latest.score,
        previous: previous?.score ?? null,
        date: latest.eval_date,
        count: sorted.length,
      }
    })
    .sort((first, second) => first.indicator.localeCompare(second.indicator))
}

export function averageOfLatest(summaries: IndicatorSummary[]): number | null {
  if (summaries.length === 0) return null
  return summaries.reduce((sum, summary) => sum + summary.latest, 0) / summaries.length
}
