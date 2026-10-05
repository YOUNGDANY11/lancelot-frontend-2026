import { apiClient } from '@/lib/apiClient'
import { fetchAllPages } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type {
  PhysicalEvaluation,
  PhysicalEvaluationRequest,
  TechnicalEvaluation,
  TechnicalEvaluationRequest,
} from '@/types/athlete'
import { withNumbers } from '@/utils/toNumber'

function normalizePhysical(evaluation: PhysicalEvaluation): PhysicalEvaluation {
  return withNumbers({ ...evaluation, eval_date: String(evaluation.eval_date).slice(0, 10) }, [
    'height_cm',
    'weight_kg',
    'vo2max_estimado',
    'speed_20m',
  ])
}

function normalizeTechnical(evaluation: TechnicalEvaluation): TechnicalEvaluation {
  return withNumbers({ ...evaluation, eval_date: String(evaluation.eval_date).slice(0, 10) }, [
    'score',
  ])
}

function byDateAsc<T extends { eval_date: string }>(items: T[]): T[] {
  return [...items].sort((first, second) => first.eval_date.localeCompare(second.eval_date))
}

export const evaluationsService = {
  async listPhysical(idUser: number): Promise<PhysicalEvaluation[]> {
    const items = await fetchAllPages<PhysicalEvaluation>(
      '/physical-evaluations',
      'evaluations',
      { id_user: idUser },
      normalizePhysical,
    )
    return byDateAsc(items)
  },

  async createPhysical(payload: PhysicalEvaluationRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/physical-evaluations', payload)
    return data
  },

  async updatePhysical(
    id: number,
    payload: Partial<PhysicalEvaluationRequest>,
  ): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/physical-evaluations/id/${id}`, payload)
    return data
  },

  async removePhysical(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/physical-evaluations/id/${id}`)
    return data
  },

  async listTechnical(idUser: number): Promise<TechnicalEvaluation[]> {
    const items = await fetchAllPages<TechnicalEvaluation>(
      '/technical-evaluations',
      'evaluations',
      { id_user: idUser },
      normalizeTechnical,
    )
    return byDateAsc(items)
  },

  async createTechnical(payload: TechnicalEvaluationRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/technical-evaluations', payload)
    return data
  },

  async updateTechnical(
    id: number,
    payload: Partial<TechnicalEvaluationRequest>,
  ): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(
      `/technical-evaluations/id/${id}`,
      payload,
    )
    return data
  },

  async removeTechnical(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/technical-evaluations/id/${id}`)
    return data
  },
}
