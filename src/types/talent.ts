import type {
  PlanFocusDimension,
  ReviewStatus,
  SeasonStatus,
  TalentFlagSource,
} from '@/constants/enums'
import type { ProgressIndex } from '@/types/athlete'

export interface RankedIndex extends ProgressIndex {
  athlete_name?: string
}

export interface TalentFlag {
  id_flag: number
  id_user: number
  athlete_name?: string
  id_season: number
  criteria: string
  recommended_action: string
  status: ReviewStatus
  source: TalentFlagSource
  score?: number | null
  triggered_rules?: string[] | null
  warnings?: string[] | null
  created_by?: number | null
  created_at?: string
}

export interface FailedAthlete {
  id_user: number
  mensaje: string
}

export interface RecalculationSummary {
  mensaje: string
  recalculated: number
  failed: FailedAthlete[]
}

export interface DetectionSummary {
  mensaje: string
  evaluated: number
  flagged: number
  created: number
  updated: number
  skipped: number
  removed: number
  failed: FailedAthlete[]
  recalculation?: { recalculated: number; failed: FailedAthlete[] }
}

export interface CreateTalentFlagRequest {
  id_user: number
  id_season: number
  criteria: string
  recommended_action: string
  created_by: number
}

export interface PlanCategoryRef {
  id_category: number
  name: string
}

export interface PlanSeasonRef {
  id_season: number
  name: string
  status: SeasonStatus
  start_date: string
  end_date: string | null
}

export interface PlanObjective {
  id_objective: number
  description: string
  target_date: string
}

export interface PlannedAthlete {
  id_user: number
  name: string
  lastname: string
  position: string | null
  current_category: PlanCategoryRef | null
  sporting_age: number | null
  suggested_category: PlanCategoryRef | null
  suggestion_reason: string
  promotion_category: PlanCategoryRef | null
  promotion_reason: string | null
  eligible_category_ids: number[]
  index_value: number | null
  focus_dimension: PlanFocusDimension | null
  focus_score: number | null
  open_objectives: PlanObjective[]
  planned_categories: string[]
}

export interface NextCyclePlan {
  source: PlanSeasonRef
  target: PlanSeasonRef | null
  reference_year: number
  athletes: PlannedAthlete[]
}

export interface ApplyPlanAthlete {
  id_user: number
  id_category: number
  id_promotion_category: number | null
  carry_objectives: boolean
}

export interface ApplyPlanRequest {
  id_target_season: number
  athletes: ApplyPlanAthlete[]
}

export interface ApplyPlanSummary {
  mensaje: string
  assigned: number
  skipped: number
  objectives_carried: number
  failed: FailedAthlete[]
}

export interface CategoryEvolutionPoint {
  id_season: number
  season_name: string
  start_date: string
  status: SeasonStatus
  athletes: number
  guests: number
  indexed: number
  index_value: number | null
  physical_score: number | null
  technical_score: number | null
  tactical_score: number | null
  participation_score: number | null
  talent_flags: number
  reviewed_talent_flags: number
}
