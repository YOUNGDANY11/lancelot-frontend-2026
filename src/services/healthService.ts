import type {
  InjuryRiskRuleCode,
  ReviewStatus,
  RiskAssessmentMethod,
  RiskLevelValue,
} from '@/constants/enums'
import { apiClient } from '@/lib/apiClient'
import { fetchAllPages, fetchList, fetchTotal, type QueryParams } from '@/lib/listRequest'
import type { ApiMessage, Pagination } from '@/types/api'
import type { HealthRecord, Injury } from '@/types/athlete'
import type {
  HealthAuditLog,
  HealthRecordRequest,
  InboxItem,
  InboxKind,
  InboxPage,
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

export interface ApiInboxItem {
  kind: InboxKind
  id: number
  id_user: number
  athlete_name: string
  date: string
  level: RiskLevelValue
  acwr_value: number | null
  acute_load: number | null
  chronic_load: number | null
  rpe_avg: number | null
  triggered_rules: string[]
  details: string | null
  method: RiskAssessmentMethod | null
}

interface ApiInboxResponse {
  items: ApiInboxItem[]
  pagination: Pagination
  counts: {
    total: number
    by_kind: Record<InboxKind, number>
    by_level: Record<RiskLevelValue, number>
  }
}

export interface InboxFilters extends QueryParams {
  status?: ReviewStatus
  kind?: InboxKind
  level?: RiskLevelValue
  page?: number
  limit?: number
}

const INBOX_URL = '/alerts/inbox'

export function mapInboxItem(item: ApiInboxItem): InboxItem {
  return {
    key: `${item.kind}-${item.id}`,
    kind: item.kind,
    id: item.id,
    id_user: item.id_user,
    athleteName: item.athlete_name || 'Deportista sin nombre',
    level: item.level,
    date: String(item.date).slice(0, 10),
    acwr: item.acwr_value ?? null,
    acuteLoad: item.acute_load ?? null,
    chronicLoad: item.chronic_load ?? null,
    rpeAvg: item.rpe_avg ?? null,
    rules: (item.triggered_rules ?? []).filter((rule): rule is InjuryRiskRuleCode => Boolean(rule)),
    details: item.details ?? null,
    method: item.method ?? null,
  }
}

async function inboxPage(filters: InboxFilters): Promise<InboxPage> {
  const { data } = await apiClient.http.get<ApiInboxResponse>(INBOX_URL, { params: filters })
  return {
    items: data.items.map(mapInboxItem),
    pagination: data.pagination,
    counts: {
      total: data.counts.total,
      byKind: data.counts.by_kind,
      byLevel: data.counts.by_level,
    },
  }
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

  listInboxPage(filters: InboxFilters): Promise<InboxPage> {
    return inboxPage(filters)
  },

  async listOpenInbox(): Promise<InboxItem[]> {
    const items = await fetchAllPages<ApiInboxItem>(INBOX_URL, 'items', { status: 'open' })
    return items.map(mapInboxItem)
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
    const [reviewed, dismissed] = await Promise.all([
      inboxPage({ status: 'reviewed', page: 1, limit: 1 }),
      inboxPage({ status: 'dismissed', page: 1, limit: 1 }),
    ])
    return { reviewed: reviewed.counts.total, dismissed: dismissed.counts.total }
  },
}
