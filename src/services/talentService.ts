import type { ReviewStatus } from '@/constants/enums'
import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type { Pagination } from '@/types/api'
import type {
  ApplyPlanRequest,
  ApplyPlanSummary,
  CreateTalentFlagRequest,
  DetectionSummary,
  NextCyclePlan,
  PlannedAthlete,
  RankedIndex,
  RankingPage,
  RecalculationSummary,
  TalentFlag,
} from '@/types/talent'
import { withNumbers } from '@/utils/toNumber'

export interface TalentFlagFilters extends QueryParams {
  id_season?: number
  id_user?: number
  status?: ReviewStatus
  source?: TalentFlag['source']
}

function normalizeIndex(index: RankedIndex): RankedIndex {
  return withNumbers(index, [
    'physical_score',
    'technical_score',
    'tactical_score',
    'participation_score',
    'contribution_score',
    'index_value',
  ])
}

function normalizeFlag(flag: TalentFlag): TalentFlag {
  return withNumbers(flag, ['score'])
}

function normalizePlannedAthlete(athlete: PlannedAthlete): PlannedAthlete {
  return withNumbers(athlete, ['index_value', 'focus_score', 'sporting_age'])
}

export interface RankingFilters extends QueryParams {
  id_season: number
  id_category?: number
  page?: number
  limit?: number
}

interface RankingResponse {
  ranking: {
    index: RankedIndex
    rank: number
    athlete_name: string
    id_category: number | null
    category_name: string | null
    position: string | null
  }[]
  pagination: Pagination
  missing: RankingPage['missing']
}

export const talentService = {
  async ranking(filters: RankingFilters): Promise<RankingPage> {
    const { data } = await apiClient.http.get<RankingResponse>('/progress-index/ranking', {
      params: filters,
    })
    return {
      entries: data.ranking.map((entry) => ({
        index: normalizeIndex(entry.index),
        rank: entry.rank,
        athleteName: entry.athlete_name,
        id_category: entry.id_category,
        category_name: entry.category_name,
        position: entry.position,
      })),
      pagination: data.pagination,
      missing: data.missing,
    }
  },

  async recalculateSeason(idSeason: number): Promise<RecalculationSummary> {
    const { data } = await apiClient.http.post<RecalculationSummary>(
      `/progress-index/recalculate-season/${idSeason}`,
    )
    return { mensaje: data.mensaje, recalculated: data.recalculated, failed: data.failed ?? [] }
  },

  async recalculateAthlete(idUser: number, idSeason: number): Promise<void> {
    await apiClient.http.post(`/progress-index/recalculate/${idUser}`, { id_season: idSeason })
  },

  listFlags(filters: TalentFlagFilters): Promise<TalentFlag[]> {
    return fetchAllPages<TalentFlag>('/talent-flags', 'flags', filters, normalizeFlag)
  },

  countFlags(filters: TalentFlagFilters): Promise<number> {
    return fetchTotal('/talent-flags', filters)
  },

  async detect(idSeason: number): Promise<DetectionSummary> {
    const { data } = await apiClient.http.post<DetectionSummary>(`/talent-flags/detect/${idSeason}`)
    return { ...data, failed: data.failed ?? [] }
  },

  async createFlag(payload: CreateTalentFlagRequest): Promise<void> {
    await apiClient.http.post('/talent-flags', payload)
  },

  async reviewFlag(id: number, status: ReviewStatus): Promise<void> {
    await apiClient.http.put(`/talent-flags/id/${id}`, { status })
  },

  async getNextCyclePlan(
    idSeason: number,
    idTarget: number | null,
    page: { page: number; limit: number },
  ): Promise<NextCyclePlan> {
    const { data } = await apiClient.http.get<{
      plan: Omit<NextCyclePlan, 'pagination'>
      pagination: Pagination
    }>(`/season-planning/${idSeason}`, {
      params: { ...page, ...(idTarget ? { id_target_season: idTarget } : {}) },
    })
    return {
      ...data.plan,
      athletes: data.plan.athletes.map(normalizePlannedAthlete),
      pagination: data.pagination,
    }
  },

  async applyNextCyclePlan(idSeason: number, payload: ApplyPlanRequest): Promise<ApplyPlanSummary> {
    const { data } = await apiClient.http.post<ApplyPlanSummary>(
      `/season-planning/${idSeason}/apply`,
      payload,
    )
    return {
      mensaje: data.mensaje,
      assigned: data.assigned,
      skipped: data.skipped,
      objectives_carried: data.objectives_carried,
      failed: data.failed ?? [],
    }
  },
}
