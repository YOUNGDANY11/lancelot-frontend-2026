import type {
  InjuryRiskRuleCode,
  ParentalConsentStatus,
  ReviewStatus,
  RiskAssessmentMethod,
  RiskLevelValue,
  SeasonStatus,
} from '@/constants/enums'

export interface Season {
  id_season: number
  name: string
  start_date: string
  end_date?: string | null
  status: SeasonStatus
}

export interface CreateSeasonRequest {
  name: string
  start_date: string
  end_date?: string
  status?: SeasonStatus
}

export type UpdateSeasonRequest = Partial<CreateSeasonRequest>

export interface Category {
  id_category: number
  name: string
  min_age: number
  max_age: number
}

export interface CreateCategoryRequest {
  name: string
  min_age: number
  max_age: number
}

export interface AthleteAssignment {
  id_ath_cat: number
  id_user: number
  id_category?: number
  category_name?: string
  name?: string
  lastname?: string
  id_season?: number | null
  position?: string | null
}

export interface CreateAthleteAssignmentRequest {
  id_user: number
  id_category: number
  id_season?: number
  position?: string
}

export interface PositionWeightProfile {
  id_profile: number
  position: string
  age_category: string
  w_physical: number
  w_technical: number
  w_participation: number
}

export interface CreateWeightProfileRequest {
  position: string
  age_category: string
  w_physical: number
  w_technical: number
  w_participation: number
}

export interface ParentalConsent {
  id_consent: number
  id_user: number
  athlete_name?: string
  guardian_name: string
  guardian_document: string
  guardian_relationship: string
  signed_at: string
  document_url?: string | null
  status: ParentalConsentStatus
}

export interface CreateParentalConsentRequest {
  id_user: number
  guardian_name: string
  guardian_document: string
  guardian_relationship: string
  signed_at: string
  document_url?: string
  status?: ParentalConsentStatus
}

export interface UpdateParentalConsentRequest {
  guardian_name?: string
  guardian_document?: string
  guardian_relationship?: string
  signed_at?: string
  document_url?: string | null
  status?: ParentalConsentStatus
}

export interface FatigueAlert {
  id_alert: number
  id_user: number
  athlete_name?: string
  date: string
  acute_load: number
  chronic_load: number
  acwr_value: number
  rpe_avg: number
  level: RiskLevelValue
  status: ReviewStatus
}

export interface InjuryRiskAssessment {
  id_assessment: number
  id_user: number
  athlete_name?: string
  assessment_date: string
  risk_level: RiskLevelValue
  status: ReviewStatus
  acwr_value?: number | null
  method?: RiskAssessmentMethod
  triggered_rules?: InjuryRiskRuleCode[]
  details?: string | null
}
