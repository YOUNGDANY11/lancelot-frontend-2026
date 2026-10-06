import type { MlEngineMode } from '@/constants/enums'

export interface EngineConfig {
  id_config: number
  engine: MlEngineMode
  min_labeled_days: number
  min_non_contact_injuries: number
  min_athletes: number
  prob_medium_threshold: number
  prob_high_threshold: number
}

export interface UpdateEngineConfigRequest {
  engine?: MlEngineMode
  prob_medium_threshold?: number
  prob_high_threshold?: number
}

export interface ReadinessCriterion {
  code: string
  descripcion: string
  value: number
  minimum: number
  met: boolean
}

export interface Readiness {
  ready: boolean
  criteria: ReadinessCriterion[]
  feature_version?: string
  labeled_rows: number
  positive_labels: number
  labeled_period: { from: string | null; to: string | null }
}

export interface DataQuality {
  period: { from: string; to: string; days: number }
  snapshots: { rows: number; days_with_snapshot: number; athletes_with_data: number }
  injuries: { total: number; without_mechanism: number; without_mechanism_pct: number | null }
  matches: { total: number; without_rpe: number; without_rpe_pct: number | null }
  load_days: {
    avg_days_without_load_pct: number | null
    per_athlete?: {
      id_user: number
      days_with_load: number
      days_without_load_pct: number | null
    }[]
  }
  warnings: string[]
}

export interface MlModelMetrics {
  roc_auc?: number | null
  pr_auc?: number | null
  recall?: number | null
  precision?: number | null
  brier?: number | null
  n_train?: number | null
  n_test?: number | null
  positives_test?: number | null
}

export interface MlModel {
  id_model: number
  version: string
  algorithm: string
  feature_version: string
  features: string[]
  metrics: MlModelMetrics
  rules_baseline_metrics?: MlModelMetrics | null
  train_from: string
  train_to: string
  test_from: string
  test_to: string
  is_synthetic: boolean
  is_active: boolean
  notes?: string | null
  created_at?: string
}

export type FeatureLabelQuality = 'pending' | 'labeled' | 'unknown_mechanism'

export interface FeatureSnapshot {
  id_feature: number
  id_user: number
  date: string
  id_category?: number | null
  position?: string | null
  acute_load_7d: number
  chronic_load_28d: number
  acwr?: number | null
  sessions_7d: number
  rpe_avg_7d?: number | null
  rules_risk_level?: 'bajo' | 'medio' | 'alto' | null
  label_injury_7d?: boolean | null
  label_quality: FeatureLabelQuality
  feature_version: string
}

export interface FailedRow {
  id_user: number
  mensaje: string
}

export interface LabelSummary {
  processed: number
  labeled_positive: number
  labeled_negative: number
  unknown_mechanism: number
  failed: FailedRow[]
}

export interface BackfillResult {
  mensaje: string
  snapshot: { athletes: number; snapshots: number; failed: FailedRow[] }
  labels: LabelSummary
}

export interface RelabelResult {
  mensaje: string
  labels: LabelSummary
}

export interface StatusSummary {
  total: number
  by_level: Record<string, number>
  by_status: Record<string, number>
  dismissal_rate: number | null
}

export interface SensitivityResult {
  injuries: number
  preceded_by_alert: number
  sensitivity: number | null
}

export interface PredictiveValueResult {
  alerts: number
  followed_by_injury: number
  positive_predictive_value: number | null
  pending_window: number
}

export interface TalentSourceSummary {
  total: number
  by_status: Record<string, number>
  acceptance_rate: number | null
}

export interface AgreementResult {
  compared: number
  agreement: number | null
}

export interface ValidationReport {
  period: { from: string; to: string }
  window_days: number
  fatigue_alerts: StatusSummary
  injury_risk_assessments: StatusSummary & { by_method?: Record<string, number> }
  rules_phase1: {
    non_contact_injuries: number
    injuries_without_mechanism: number
    sensitivity: SensitivityResult
    positive_predictive_value: PredictiveValueResult
  }
  talent: Record<string, TalentSourceSummary>
  shadow_mode: {
    agreement: AgreementResult
    sensitivity: SensitivityResult
    positive_predictive_value: PredictiveValueResult
  } | null
  definitions: Record<string, string>
  warnings: string[]
}
