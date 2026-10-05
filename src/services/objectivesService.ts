import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { DevelopmentObjective, DevelopmentObjectiveRequest } from '@/types/athlete'

function normalizeObjective(objective: DevelopmentObjective): DevelopmentObjective {
  return { ...objective, target_date: String(objective.target_date).slice(0, 10) }
}

export const objectivesService = {
  list(idUser: number): Promise<DevelopmentObjective[]> {
    return fetchAllPages<DevelopmentObjective>(
      '/development-objectives',
      'objectives',
      { id_user: idUser },
      normalizeObjective,
    )
  },

  async create(payload: DevelopmentObjectiveRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/development-objectives', payload)
    return data
  },

  async update(id: number, payload: Partial<DevelopmentObjectiveRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(
      `/development-objectives/id/${id}`,
      payload,
    )
    return data
  },

  async remove(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/development-objectives/id/${id}`)
    return data
  },
}
