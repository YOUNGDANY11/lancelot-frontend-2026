import type { ReviewStatus } from '@/constants/enums'
import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type {
  CreateTalentFlagRequest,
  DetectionSummary,
  RankedIndex,
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
    'participation_score',
    'index_value',
  ])
}

function normalizeFlag(flag: TalentFlag): TalentFlag {
  return withNumbers(flag, ['score'])
}

export const talentService = {
  listIndices(idSeason: number): Promise<RankedIndex[]> {
    return fetchAllPages<RankedIndex>(
      '/progress-index',
      'indices',
      { id_season: idSeason },
      normalizeIndex,
    )
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
}
