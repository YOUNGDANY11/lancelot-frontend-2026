import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type {
  CreateParentalConsentRequest,
  ParentalConsent,
  UpdateParentalConsentRequest,
} from '@/types/club'

export interface ParentalConsentFilters extends QueryParams {
  id_user?: number
  status?: ParentalConsent['status']
  page?: number
  limit?: number
}

function normalizeConsent(consent: ParentalConsent): ParentalConsent {
  return { ...consent, signed_at: String(consent.signed_at).slice(0, 10) }
}

export const parentalConsentsService = {
  listAll(filters: ParentalConsentFilters = {}): Promise<ParentalConsent[]> {
    return fetchAllPages<ParentalConsent>(
      '/parental-consents',
      'consents',
      filters,
      normalizeConsent,
    )
  },

  listPage(filters: ParentalConsentFilters) {
    return fetchList<ParentalConsent>('/parental-consents', 'consents', filters, normalizeConsent)
  },

  async create(payload: CreateParentalConsentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/parental-consents', payload)
    return data
  },

  async update(id: number, payload: UpdateParentalConsentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/parental-consents/id/${id}`, payload)
    return data
  },

  async remove(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/parental-consents/id/${id}`)
    return data
  },
}
