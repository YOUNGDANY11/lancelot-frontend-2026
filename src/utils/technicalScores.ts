import type { EvaluationDimension } from '@/constants/enums'
import type { TechnicalEvaluation } from '@/types/athlete'

export function dimensionOf(evaluation: { dimension?: EvaluationDimension }): EvaluationDimension {
  return evaluation.dimension ?? 'tecnica'
}

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
    const key = `${dimensionOf(evaluation)}|${evaluation.indicator.trim()}`
    byIndicator.set(key, [...(byIndicator.get(key) ?? []), evaluation])
  }
  return [...byIndicator.entries()]
    .map(([key, items]) => {
      const [dimension, indicator] = key.split('|') as [EvaluationDimension, string]
      const sorted = [...items].sort((first, second) =>
        first.eval_date.localeCompare(second.eval_date),
      )
      const latest = sorted[sorted.length - 1]
      const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null
      return {
        dimension,
        indicator,
        latest: latest.score,
        previous: previous?.score ?? null,
        date: latest.eval_date,
        count: sorted.length,
      }
    })
    .sort(
      (first, second) =>
        first.dimension.localeCompare(second.dimension) ||
        first.indicator.localeCompare(second.indicator),
    )
}
