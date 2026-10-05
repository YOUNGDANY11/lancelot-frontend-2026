import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchTotal } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { CreateWeightProfileRequest, PositionWeightProfile } from '@/types/club'
import { toNumberOr } from '@/utils/toNumber'

function normalizeProfile(profile: PositionWeightProfile): PositionWeightProfile {
  return {
    ...profile,
    w_physical: toNumberOr(profile.w_physical, 0),
    w_technical: toNumberOr(profile.w_technical, 0),
    w_participation: toNumberOr(profile.w_participation, 0),
  }
}

export const weightProfilesService = {
  listAll(): Promise<PositionWeightProfile[]> {
    return fetchAllPages<PositionWeightProfile>(
      '/position-weight-profiles',
      'profiles',
      {},
      normalizeProfile,
    )
  },

  count(): Promise<number> {
    return fetchTotal('/position-weight-profiles')
  },

  async create(payload: CreateWeightProfileRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/position-weight-profiles', payload)
    return data
  },
}
