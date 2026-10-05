import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { AthleteAssignment, CreateAthleteAssignmentRequest } from '@/types/club'
import { getApiErrorStatus } from '@/utils/parseApiError'

export interface AthleteAssignmentFilters extends QueryParams {
  id_category?: number
  id_season?: number
  name?: string
  page?: number
  limit?: number
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

  async getMine(): Promise<AthleteAssignment | null> {
    try {
      const { data } = await apiClient.http.get<{ athInCat: AthleteAssignment }>(
        '/athletes-in-categories/me',
      )
      return data.athInCat
    } catch (error) {
      if (getApiErrorStatus(error) === 404) return null
      throw error
    }
  },

  async create(payload: CreateAthleteAssignmentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/athletes-in-categories', payload)
    return data
  },
}
