import { LEVEL_PRIORITY } from '@/constants/health'
import type { RiskLevelValue } from '@/constants/enums'
import type { FatigueAlert, InjuryRiskAssessment } from '@/types/club'
import type { InboxItem, InboxKind } from '@/types/health'

function fromFatigueAlert(alert: FatigueAlert): InboxItem {
  return {
    key: `fatigue-${alert.id_alert}`,
    kind: 'fatigue',
    id: alert.id_alert,
    id_user: alert.id_user,
    athleteName: alert.athlete_name || 'Deportista sin nombre',
    level: alert.level,
    date: alert.date,
    acwr: alert.acwr_value ?? null,
    acuteLoad: alert.acute_load ?? null,
    chronicLoad: alert.chronic_load ?? null,
    rpeAvg: alert.rpe_avg ?? null,
    rules: [],
    details: null,
    method: null,
  }
}

function fromRiskAssessment(assessment: InjuryRiskAssessment): InboxItem {
  return {
    key: `risk-${assessment.id_assessment}`,
    kind: 'risk',
    id: assessment.id_assessment,
    id_user: assessment.id_user,
    athleteName: assessment.athlete_name || 'Deportista sin nombre',
    level: assessment.risk_level,
    date: assessment.assessment_date,
    acwr: assessment.acwr_value ?? null,
    acuteLoad: null,
    chronicLoad: null,
    rpeAvg: null,
    rules: assessment.triggered_rules ?? [],
    details: assessment.details ?? null,
    method: assessment.method ?? null,
  }
}

export function buildInbox(
  alerts: FatigueAlert[],
  assessments: InjuryRiskAssessment[],
): InboxItem[] {
  return [...alerts.map(fromFatigueAlert), ...assessments.map(fromRiskAssessment)].sort(
    (first, second) =>
      LEVEL_PRIORITY[first.level] - LEVEL_PRIORITY[second.level] ||
      second.date.localeCompare(first.date) ||
      first.athleteName.localeCompare(second.athleteName, 'es'),
  )
}

export function filterInbox(
  items: InboxItem[],
  kind: InboxKind | 'all',
  level: RiskLevelValue | 'all',
): InboxItem[] {
  return items.filter(
    (item) => (kind === 'all' || item.kind === kind) && (level === 'all' || item.level === level),
  )
}

export function countByLevel(items: InboxItem[]): Record<RiskLevelValue, number> {
  const counts: Record<RiskLevelValue, number> = { alto: 0, medio: 0, bajo: 0 }
  for (const item of items) counts[item.level] += 1
  return counts
}
