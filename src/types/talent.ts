import type { ReviewStatus, TalentFlagSource } from '@/constants/enums'
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
