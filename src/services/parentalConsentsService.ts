import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { CreateParentalConsentRequest, ParentalConsent } from '@/types/club'

export interface ParentalConsentFilters extends QueryParams {
  id_user?: number
  status?: ParentalConsent['status']
}

export const parentalConsentsService = {
  listAll(filters: ParentalConsentFilters = {}): Promise<ParentalConsent[]> {
    return fetchAllPages<ParentalConsent>('/parental-consents', 'consents', filters)
  },

  async create(payload: CreateParentalConsentRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/parental-consents', payload)
    return data
  },
}
