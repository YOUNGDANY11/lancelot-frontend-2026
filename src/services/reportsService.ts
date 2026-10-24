import { apiClient } from '@/lib/apiClient'
import type { Pagination } from '@/types/api'
import type { ProgressIndex, SeasonComparisonPoint, SeasonSummary } from '@/types/athlete'
import type { CategoryEvolutionPoint } from '@/types/talent'
import { getApiErrorStatus } from '@/utils/parseApiError'
import { withNumbers } from '@/utils/toNumber'

const SCORE_KEYS = [
  'physical_score',
  'technical_score',
  'tactical_score',
  'participation_score',
  'index_value',
] as const

export const reportsService = {
  async seasonSummary(idUser: number, idSeason: number): Promise<SeasonSummary> {
    const { data } = await apiClient.http.get<{ summary: SeasonSummary }>(
      `/reports/season-summary/${idUser}/${idSeason}`,
    )
    const { summary } = data
    return {
      ...summary,
      weighted_progress_index: summary.weighted_progress_index
        ? withNumbers<ProgressIndex>(summary.weighted_progress_index, [
            ...SCORE_KEYS,
            'contribution_score',
          ])
        : null,
      fatigue_alerts: summary.fatigue_alerts.map((alert) =>
        withNumbers(alert, ['acwr_value', 'acute_load', 'chronic_load', 'rpe_avg']),
      ),
      injury_risk_assessments: summary.injury_risk_assessments.map((assessment) =>
        withNumbers(assessment, ['acwr_value']),
      ),
    }
  },

  async categoryEvolution(idCategory: number): Promise<CategoryEvolutionPoint[]> {
    const { data } = await apiClient.http.get<{ evolution: CategoryEvolutionPoint[] }>(
      `/reports/category-evolution/${idCategory}`,
    )
    return data.evolution.map((point) => withNumbers(point, [...SCORE_KEYS]))
  },

  async categoryEvolutionPage(idCategory: number, page: { page: number; limit: number }) {
    const { data } = await apiClient.http.get<{
      evolution: CategoryEvolutionPoint[]
      pagination: Pagination
    }>(`/reports/category-evolution/${idCategory}`, { params: page })
    return {
      items: data.evolution.map((point) => withNumbers(point, [...SCORE_KEYS])),
      pagination: data.pagination,
    }
  },

  async seasonComparison(idUser: number): Promise<SeasonComparisonPoint[]> {
    try {
      const { data } = await apiClient.http.get<{ comparison: SeasonComparisonPoint[] }>(
        `/reports/season-comparison/${idUser}`,
      )
      return data.comparison.map((point) => withNumbers(point, [...SCORE_KEYS]))
    } catch (error) {
      if (getApiErrorStatus(error) === 404) return []
      throw error
    }
  },
}
