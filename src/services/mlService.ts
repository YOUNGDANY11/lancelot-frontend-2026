import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'
import type {
  BackfillResult,
  DataQuality,
  EngineConfig,
  FeatureLabelQuality,
  FeatureSnapshot,
  MlModel,
  MlModelMetrics,
  Readiness,
  RelabelResult,
  UpdateEngineConfigRequest,
  ValidationReport,
} from '@/types/ml'
import { withNumbers } from '@/utils/toNumber'

export interface DateRange extends QueryParams {
  from?: string
  to?: string
}

export interface FeatureFilters extends DateRange {
  id_user?: number
  label_quality?: FeatureLabelQuality
  page?: number
  limit?: number
}

const METRIC_KEYS: (keyof MlModelMetrics)[] = [
  'roc_auc',
  'pr_auc',
  'recall',
  'precision',
  'brier',
  'n_train',
  'n_test',
  'positives_test',
]

function normalizeModel(model: MlModel): MlModel {
  return {
    ...model,
    metrics: withNumbers(model.metrics ?? {}, METRIC_KEYS),
    rules_baseline_metrics: model.rules_baseline_metrics
      ? withNumbers(model.rules_baseline_metrics, METRIC_KEYS)
      : null,
  }
}

function normalizeFeature(row: FeatureSnapshot): FeatureSnapshot {
  return withNumbers({ ...row, date: String(row.date).slice(0, 10) }, [
    'acute_load_7d',
    'chronic_load_28d',
    'acwr',
    'rpe_avg_7d',
  ])
}

function normalizeEngine(config: EngineConfig): EngineConfig {
  return withNumbers(config, ['prob_medium_threshold', 'prob_high_threshold'])
}

export const mlService = {
  async engineConfig(): Promise<EngineConfig> {
    const { data } = await apiClient.http.get<{ config: EngineConfig }>('/ml/engine-config')
    return normalizeEngine(data.config)
  },

  async updateEngine(payload: UpdateEngineConfigRequest): Promise<EngineConfig> {
    const { data } = await apiClient.http.put<{ config: EngineConfig }>(
      '/ml/engine-config',
      payload,
    )
    return normalizeEngine(data.config)
  },

  async readiness(): Promise<Readiness> {
    const { data } = await apiClient.http.get<{ readiness: Readiness }>('/ml/readiness')
    return data.readiness
  },

  async dataQuality(range: DateRange = {}): Promise<DataQuality> {
    const { data } = await apiClient.http.get<{ data_quality: DataQuality }>('/ml/data-quality', {
      params: Object.fromEntries(Object.entries(range).filter(([, value]) => value)),
    })
    return data.data_quality
  },

  listModels(): Promise<MlModel[]> {
    return fetchAllPages<MlModel>('/ml/models', 'models', {}, normalizeModel)
  },

  async activateModel(id: number): Promise<string> {
    const { data } = await apiClient.http.put<{ mensaje: string }>(`/ml/models/id/${id}/activate`)
    return data.mensaje
  },

  listFeatures(filters: FeatureFilters) {
    return fetchList<FeatureSnapshot>('/ml/features', 'features', filters, normalizeFeature)
  },

  async exportFeatures(range: { from: string; to: string }): Promise<Blob> {
    try {
      const { data } = await apiClient.http.get<Blob>('/ml/features/export', {
        params: range,
        responseType: 'blob',
      })
      return data
    } catch (error) {
      const response = (error as { response?: { data?: unknown } } | null)?.response
      if (response?.data instanceof Blob) {
        const text = await response.data.text()
        try {
          response.data = JSON.parse(text)
        } catch {
          response.data = { mensaje: text }
        }
      }
      throw error
    }
  },

  async backfill(range: { from: string; to: string }): Promise<BackfillResult> {
    const { data } = await apiClient.http.post<BackfillResult>('/ml/features/backfill', null, {
      params: range,
    })
    return data
  },

  async relabel(range: { from: string; to: string }): Promise<RelabelResult> {
    const { data } = await apiClient.http.post<RelabelResult>('/ml/features/relabel', null, {
      params: range,
    })
    return data
  },

  async validationReport(range: { from: string; to: string }): Promise<ValidationReport> {
    const { data } = await apiClient.http.get<{ report: ValidationReport }>('/reports/validation', {
      params: range,
    })
    return data.report
  },
}
