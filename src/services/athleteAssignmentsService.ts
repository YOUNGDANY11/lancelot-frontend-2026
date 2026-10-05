import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { AssignmentHistoryItem } from '@/types/athlete'
import type { AthleteAssignment, CreateAthleteAssignmentRequest } from '@/types/club'
import { getApiErrorStatus } from '@/utils/parseApiError'

export interface AthleteAssignmentFilters extends QueryParams {
  id_category?: number
  id_season?: number
  name?: string
  page?: number
  limit?: number
}

export interface UpdateAthleteAssignmentRequest {
  id_category?: number
  position?: string
}

export const athleteAssignmentsService = {
  list(filters: AthleteAssignmentFilters) {
    return fetchList<AthleteAssignment>('/athletes-in-categories', 'athInCat', filters)
  },

  listAll(filters: AthleteAssignmentFilters): Promise<AthleteAssignment[]> {
    return fetchAllPages<AthleteAssignment>('/athletes-in-categories', 'athInCat', filters)
  },

  count(filters: AthleteAssignmentFilters): Promise<number> {
    return fetchTotal('/athletes-in-categories', filters)
  },

  async getMine(): Promise<AthleteAssignment[]> {
    try {
      const { data } = await apiClient.http.get<{
        athInCat?: AthleteAssignment
        athInCats?: AthleteAssignment[]
      }>('/athletes-in-categories/me')
      return data.athInCats ?? (data.athInCat ? [data.athInCat] : [])
    } catch (error) {
      if (getApiErrorStatus(error) === 404) return []
      throw error
    }
  },

  async history(idUser: number): Promise<AssignmentHistoryItem[]> {
    try {
      const { data } = await apiClient.http.get<{ history: AssignmentHistoryItem[] }>(
        `/athletes-in-categories/history/${idUser}`,
      )
      return data.history ?? []
    } catch (error) {
      if (getApiErrorStatus(error) === 404) return []
      throw error
    }
  },

  async create(payload: CreateAthleteAssignmentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/athletes-in-categories', payload)
    return data
  },

  async update(idAssignment: number, payload: UpdateAthleteAssignmentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(
      `/athletes-in-categories/id/${idAssignment}`,
      payload,
    )
    return data
  },

  async remove(idAssignment: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(
      `/athletes-in-categories/id/${idAssignment}`,
    )
    return data
  },
}
