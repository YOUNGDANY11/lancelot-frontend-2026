import type {
  HealthAccessAction,
  HealthRecordStatus,
  InjuryMechanism,
  InjuryRiskRuleCode,
  InjurySeverity,
  InjuryStatus,
  ReviewStatus,
  RiskAssessmentMethod,
  RiskLevelValue,
} from '@/constants/enums'

export type InboxKind = 'fatigue' | 'risk'

export interface InboxItem {
  key: string
  kind: InboxKind
  id: number
  id_user: number
  athleteName: string
  level: RiskLevelValue
  date: string
  acwr: number | null
  acuteLoad: number | null
  chronicLoad: number | null
  rpeAvg: number | null
  rules: InjuryRiskRuleCode[]
  details: string | null
  method: RiskAssessmentMethod | null
}

export interface ReviewDecision {
  item: InboxItem
  status: Exclude<ReviewStatus, 'open'>
}

export interface ReviewStatusTotals {
  reviewed: number
  dismissed: number
}

export interface InjuryRequest {
  id_user?: number
  injury_date: string
  body_part: string
  severity: InjurySeverity
  status: InjuryStatus
  mechanism?: InjuryMechanism
  diagnosis?: string | null
  recovery_date?: string | null
  time_loss_days?: number | null
  registered_by?: number
}

export interface InjuryMechanismTotals {
  total: number
  contact: number
  nonContact: number
  missing: number
}

export interface HealthRecordRequest {
  id_user?: number
  condition_type: string
  description: string
  restriction: boolean
  status: HealthRecordStatus
  registered_by?: number
}

export interface HealthAuditLog {
  id_log: number
  id_health?: number | null
  accessed_by: number
  accessed_by_name?: string
  action: HealthAccessAction
  accessed_at: string
}
