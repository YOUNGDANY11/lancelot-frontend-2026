import { apiClient } from '@/lib/apiClient'
import type { DataQuality, EngineConfig, Readiness } from '@/types/ml'
import { withNumbers } from '@/utils/toNumber'

export const mlService = {
  async engineConfig(): Promise<EngineConfig> {
    const { data } = await apiClient.http.get<{ config: EngineConfig }>('/ml/engine-config')
    return withNumbers(data.config, ['prob_medium_threshold', 'prob_high_threshold'])
  },

  async readiness(): Promise<Readiness> {
    const { data } = await apiClient.http.get<{ readiness: Readiness }>('/ml/readiness')
    return data.readiness
  },

  async dataQuality(range: { from?: string; to?: string } = {}): Promise<DataQuality> {
    const { data } = await apiClient.http.get<{ data_quality: DataQuality }>('/ml/data-quality', {
      params: range,
    })
    return data.data_quality
  },
}
