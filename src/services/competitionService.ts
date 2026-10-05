import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type {
  CallUp,
  Competency,
  CompetencyRequest,
  CreateCallUpRequest,
  Match,
  MatchRequest,
} from '@/types/competition'

export interface MatchFilters extends QueryParams {
  id_category?: number
  id_competency?: number
  page?: number
  limit?: number
}

function normalizeCompetency(competency: Competency): Competency {
  return {
    ...competency,
    start_date: String(competency.start_date ?? '').slice(0, 10),
    finish_date: competency.finish_date ? String(competency.finish_date).slice(0, 10) : null,
  }
}

export const competitionService = {
  listCompetencies(idSeason?: number): Promise<Competency[]> {
    return fetchAllPages<Competency>(
      '/competencies',
      'competency',
      { id_season: idSeason },
      normalizeCompetency,
    )
  },

  async createCompetency(payload: CompetencyRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/competencies', payload)
    return data
  },

  async updateCompetency(id: number, payload: Partial<CompetencyRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/competencies/id/${id}`, payload)
    return data
  },

  async removeCompetency(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/competencies/id/${id}`)
    return data
  },

  listAllMatches(filters: MatchFilters): Promise<Match[]> {
    return fetchAllPages<Match>('/matches', 'matches', filters)
  },

  listMatches(filters: MatchFilters) {
    return fetchList<Match>('/matches', 'matches', filters)
  },

  async createMatch(payload: MatchRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/matches', payload)
    return data
  },

  async updateMatch(id: number, payload: Partial<MatchRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/matches/id/${id}`, payload)
    return data
  },

  async removeMatch(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/matches/id/${id}`)
    return data
  },

  listCallUps(idCompetency: number): Promise<CallUp[]> {
    return fetchAllPages<CallUp>('/athletes-in-competencies', 'athInCat', {
      id_competency: idCompetency,
    })
  },

  async createCallUp(payload: CreateCallUpRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/athletes-in-competencies', payload)
    return data
  },

  async removeCallUp(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/athletes-in-competencies/id/${id}`)
    return data
  },
}
