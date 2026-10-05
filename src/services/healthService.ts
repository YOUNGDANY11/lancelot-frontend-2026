import type { InjuryRiskRuleCode, ReviewStatus } from '@/constants/enums'
import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage } from '@/types/api'
import type { HealthRecord, Injury } from '@/types/athlete'
import type { FatigueAlert, InjuryRiskAssessment } from '@/types/club'
import type {
  HealthAuditLog,
  HealthRecordRequest,
  InjuryMechanismTotals,
  InjuryRequest,
  ReviewStatusTotals,
} from '@/types/health'
import { withNumbers } from '@/utils/toNumber'

export interface InjuryFilters extends QueryParams {
  id_user?: number
  status?: Injury['status']
  severity?: Injury['severity']
  mechanism?: NonNullable<Injury['mechanism']>
  page?: number
  limit?: number
}

export interface HealthRecordFilters extends QueryParams {
  id_user?: number
  status?: HealthRecord['status']
  page?: number
  limit?: number
}

export interface HealthAuditFilters extends QueryParams {
  id_health?: number
  page?: number
  limit?: number
}

function apiDate(value: string | null | undefined): string | null {
  return value ? String(value).slice(0, 10) : null
}

function normalizeInjury(injury: Injury): Injury {
  return withNumbers(
    {
      ...injury,
      injury_date: String(injury.injury_date).slice(0, 10),
      recovery_date: apiDate(injury.recovery_date),
    },
    ['time_loss_days'],
  )
}

function normalizeFatigueAlert(alert: FatigueAlert): FatigueAlert {
  return withNumbers({ ...alert, date: String(alert.date).slice(0, 10) }, [
    'acwr_value',
    'acute_load',
    'chronic_load',
    'rpe_avg',
  ])
}

function normalizeRiskAssessment(assessment: InjuryRiskAssessment): InjuryRiskAssessment {
  return withNumbers(
    {
      ...assessment,
      assessment_date: String(assessment.assessment_date).slice(0, 10),
      triggered_rules: (assessment.triggered_rules ?? []).filter(
        (rule): rule is InjuryRiskRuleCode => Boolean(rule),
      ),
    },
    ['acwr_value'],
  )
}

async function reviewTotals(url: string): Promise<ReviewStatusTotals> {
  const [reviewed, dismissed] = await Promise.all([
    fetchTotal(url, { status: 'reviewed' }),
    fetchTotal(url, { status: 'dismissed' }),
  ])
  return { reviewed, dismissed }
}

export const healthService = {
  listInjuries(idUser: number): Promise<Injury[]> {
    return fetchAllPages<Injury>('/injuries', 'injuries', { id_user: idUser }, normalizeInjury)
  },

  listInjuriesPage(filters: InjuryFilters) {
    return fetchList<Injury>('/injuries', 'injuries', filters, normalizeInjury)
  },

  listAllInjuries(filters: InjuryFilters = {}): Promise<Injury[]> {
    return fetchAllPages<Injury>('/injuries', 'injuries', filters, normalizeInjury)
  },

  async injuryMechanismTotals(): Promise<InjuryMechanismTotals> {
    const [total, contact, nonContact] = await Promise.all([
      fetchTotal('/injuries'),
      fetchTotal('/injuries', { mechanism: 'contacto' }),
      fetchTotal('/injuries', { mechanism: 'sin_contacto' }),
    ])
    return { total, contact, nonContact, missing: Math.max(total - contact - nonContact, 0) }
  },

  async createInjury(payload: InjuryRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/injuries', payload)
    return data
  },

  async updateInjury(id: number, payload: Partial<InjuryRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/injuries/id/${id}`, payload)
    return data
  },

  async removeInjury(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/injuries/id/${id}`)
    return data
  },

  listHealthRecords(idUser: number): Promise<HealthRecord[]> {
    return fetchAllPages<HealthRecord>('/health-records', 'records', { id_user: idUser })
  },

  listHealthRecordsPage(filters: HealthRecordFilters) {
    return fetchList<HealthRecord>('/health-records', 'records', filters)
  },

  async createHealthRecord(payload: HealthRecordRequest): Promise<ApiMessage> {
    const { data } = await apiClient.http.post<ApiMessage>('/health-records', payload)
    return data
  },

  async updateHealthRecord(id: number, payload: Partial<HealthRecordRequest>): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/health-records/id/${id}`, payload)
    return data
  },

  async removeHealthRecord(id: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(`/health-records/id/${id}`)
    return data
  },

  listAuditLogs(filters: HealthAuditFilters) {
    return fetchList<HealthAuditLog>('/health-records/audit/logs', 'logs', filters)
  },

  listOpenFatigueAlerts(): Promise<FatigueAlert[]> {
    return fetchAllPages<FatigueAlert>(
      '/fatigue-alerts',
      'alerts',
      { status: 'open' },
      normalizeFatigueAlert,
    )
  },

  listOpenRiskAssessments(): Promise<InjuryRiskAssessment[]> {
    return fetchAllPages<InjuryRiskAssessment>(
      '/injury-risk-assessments',
      'assessments',
      { status: 'open' },
      normalizeRiskAssessment,
    )
  },

  async reviewFatigueAlert(id: number, status: ReviewStatus): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/fatigue-alerts/id/${id}`, { status })
    return data
  },

  async reviewRiskAssessment(id: number, status: ReviewStatus): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(`/injury-risk-assessments/id/${id}`, {
      status,
    })
    return data
  },

  async reviewTotals(): Promise<ReviewStatusTotals> {
    const [fatigue, risk] = await Promise.all([
      reviewTotals('/fatigue-alerts'),
      reviewTotals('/injury-risk-assessments'),
    ])
    return {
      reviewed: fatigue.reviewed + risk.reviewed,
      dismissed: fatigue.dismissed + risk.dismissed,
    }
  },
}
