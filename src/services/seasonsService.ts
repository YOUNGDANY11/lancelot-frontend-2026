import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { CreateSeasonRequest, Season, UpdateSeasonRequest } from '@/types/club'

interface SeasonResponse {
  season: Season
}

export const seasonsService = {
  listAll(): Promise<Season[]> {
    return fetchAllPages<Season>('/seasons', 'seasons')
  },

  async create(payload: CreateSeasonRequest): Promise<Season> {
    const { data } = await apiClient.http.post<SeasonResponse>('/seasons', payload)
    return data.season
  },

  async update(idSeason: number, payload: UpdateSeasonRequest): Promise<Season> {
    const { data } = await apiClient.http.put<SeasonResponse>(`/seasons/id/${idSeason}`, payload)
    return data.season
  },

  async remove(idSeason: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/seasons/id/${idSeason}`)
    return data
  },
}
