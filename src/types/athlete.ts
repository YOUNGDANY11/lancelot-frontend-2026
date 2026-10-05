import type {
  DevelopmentObjectiveStatus,
  HealthRecordStatus,
  InjuryMechanism,
  InjurySeverity,
  InjuryStatus,
  PhysicalEvaluationStage,
  RiskLevelValue,
  Vo2TestMethod,
} from '@/constants/enums'
import type { FatigueAlert, InjuryRiskAssessment } from '@/types/club'

export interface PhysicalEvaluation {
  id_eval: number
  id_user: number
  id_season: number
  season_name?: string
  stage: PhysicalEvaluationStage
  height_cm: number
  weight_kg: number
  vo2max_estimado?: number | null
  test_method?: Vo2TestMethod | null
  speed_20m?: number | null
  eval_date: string
  evaluator_id?: number | null
  evaluator_name?: string | null
}

export interface PhysicalEvaluationRequest {
  id_user: number
  id_season: number
  stage: PhysicalEvaluationStage
  height_cm: number
  weight_kg: number
  vo2max_estimado?: number
  test_method?: Vo2TestMethod
  speed_20m?: number
  eval_date: string
  evaluator_id?: number
}

export interface TechnicalEvaluation {
  id_eval_tech: number
  id_user: number
  id_season: number
  season_name?: string
  indicator: string
  score: number
  evaluator_id: number
  evaluator_name?: string
  eval_date: string
}

export interface TechnicalEvaluationRequest {
  id_user: number
  id_season: number
  indicator: string
  score: number
  evaluator_id: number
  eval_date: string
}

export interface DevelopmentObjective {
  id_objective: number
  id_user: number
  id_season: number
  season_name?: string
  description: string
  target_date: string
  status: DevelopmentObjectiveStatus
  set_by: number
  set_by_name?: string
}

export interface DevelopmentObjectiveRequest {
  id_user: number
  id_season: number
  description: string
  target_date: string
  status?: DevelopmentObjectiveStatus
  set_by: number
}

export interface TrainingLoad {
  id_load: number
  id_session: number
  session_date?: string
  id_user: number
  rpe: number
  duration_min: number
  session_load: number
}

export interface AcwrThresholds {
  low_min: number
  low_max: number
  medium_max: number
}

export interface AcwrSeriesPoint {
  date: string
  daily_load: number
  sessions: number
  acute_load: number
  chronic_load: number
  acwr: number | null
  level: RiskLevelValue | null
}

export interface AthleteAcwrSeries {
  thresholds: AcwrThresholds
  series: AcwrSeriesPoint[]
}

export interface Injury {
  id_injury: number
  id_user: number
  athlete_name?: string
  injury_date: string
  body_part: string
  severity: InjurySeverity
  diagnosis?: string | null
  recovery_date?: string | null
  status: InjuryStatus
  mechanism?: InjuryMechanism | null
  time_loss_days?: number | null
  registered_by?: number
  registered_by_name?: string
}

export interface HealthRecord {
  id_health: number
  id_user: number
  athlete_name?: string
  condition_type: string
  description?: string
  restriction: boolean
  status: HealthRecordStatus
  registered_by?: number
  registered_by_name?: string
  created_at?: string
}

export interface ProgressIndex {
  id_index: number
  id_user: number
  id_season: number
  physical_score: number
  technical_score: number
  participation_score: number
  index_value: number
  warnings?: string[] | null
}

export interface SeasonSummary {
  athlete: {
    id_user: number
    name: string
    lastname: string
    position: string | null
    category: string | null
  }
  season: { id_season: number; name: string }
  training_participation: {
    total_sessions: number
    sessions_attended: number
    attendance_rate: number
    avg_rpe: number
    total_session_load: number
  }
  match_participation: {
    matches_in_season: number
    matches_played: number
    total_minutes: number
    goals: number
    assists: number
    yellow_cards: number
    red_cards: number
  }
  fatigue_alerts: FatigueAlert[]
  injury_risk_assessments: InjuryRiskAssessment[]
  weighted_progress_index: ProgressIndex | null
}

export interface SeasonComparisonPoint {
  id_season: number
  season_name: string
  start_date: string
  physical_score: number
  technical_score: number
  participation_score: number
  index_value: number
}

export interface AssignmentHistoryItem {
  id_ath_cat: number
  id_user: number
  id_category?: number
  category_name?: string
  id_season?: number | null
  position?: string | null
  created_at?: string
}
