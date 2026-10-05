import type { RiskLevelValue, TrainingSessionType } from '@/constants/enums'
import type { AcwrThresholds } from '@/types/athlete'

export interface TrainingSession {
  id_session: number
  id_category: number
  category_name?: string
  id_season: number
  season_name?: string
  date: string
  type: TrainingSessionType
  planned_duration_min: number
}

export interface TrainingSessionRequest {
  id_category: number
  id_season: number
  date: string
  type: TrainingSessionType
  planned_duration_min: number
}

export interface SessionLoad {
  id_load: number
  id_session: number
  id_user: number
  rpe: number
  duration_min: number
  session_load: number
}

export interface TrainingLoadRequest {
  id_session: number
  id_user: number
  rpe: number
  duration_min: number
}

export interface MatchStatistic {
  id_match_stat: number
  id_match: number
  id_user: number
  athlete_name?: string
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  rpe?: number | null
}

export interface MatchStatisticRequest {
  id_match: number
  id_user: number
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
  rpe?: number
}

export interface TeamAcwrAthlete {
  id_user: number
  name: string | null
  lastname: string | null
  position: string | null
  daily_load: number
  acute_load: number
  chronic_load: number
  acwr: number | null
  level: RiskLevelValue | null
  sessions_7d: number
}

export interface TeamAcwr {
  category: { id_category: number; name: string }
  season: { id_season: number; name: string } | null
  date: string
  thresholds: AcwrThresholds
  athletes: TeamAcwrAthlete[]
}
