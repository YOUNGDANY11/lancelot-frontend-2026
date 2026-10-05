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
  load_days: { avg_days_without_load_pct: number | null }
  warnings: string[]
}
