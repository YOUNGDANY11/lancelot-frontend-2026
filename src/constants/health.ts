import type { Permission } from '@/constants/permissions'
import type { RiskLevelValue } from '@/constants/enums'
import type { InboxKind } from '@/types/health'

export type HealthTab = 'alertas' | 'lesiones' | 'registros' | 'consentimientos' | 'auditoria'

export const HEALTH_TABS: { value: HealthTab; label: string; permission?: Permission }[] = [
  { value: 'alertas', label: 'Bandeja de alertas' },
  { value: 'lesiones', label: 'Lesiones', permission: 'viewInjuries' },
  { value: 'registros', label: 'Registros de salud', permission: 'viewHealthRecords' },
  { value: 'consentimientos', label: 'Consentimientos', permission: 'viewConsents' },
  { value: 'auditoria', label: 'Auditoría', permission: 'viewHealthAudit' },
]

export const INBOX_KIND_LABELS: Record<InboxKind, string> = {
  fatigue: 'Alerta de fatiga',
  risk: 'Riesgo de lesión',
}

export const INBOX_KIND_FILTERS: { value: InboxKind | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'fatigue', label: 'Fatiga' },
  { value: 'risk', label: 'Riesgo de lesión' },
]

export const LEVEL_PRIORITY: Record<RiskLevelValue, number> = { alto: 0, medio: 1, bajo: 2 }

export const INBOX_COPY = {
  decisionNote: 'El sistema sugiere; tú decides.',
  description:
    'Las alertas se generan cada noche a partir de la carga (RPE × minutos) y del historial de lesiones. Revisa cada una y márcala como revisada o descártala.',
  empty: 'No hay alertas pendientes',
  emptyDescription: 'Cuando el sistema detecte una carga de riesgo, la verás aquí.',
} as const

export const BODY_PARTS = [
  'Tobillo',
  'Rodilla',
  'Isquiotibiales',
  'Cuádriceps',
  'Aductores',
  'Gemelos',
  'Pie',
  'Cadera',
  'Zona lumbar',
  'Hombro',
  'Muñeca',
  'Mano',
  'Cabeza',
] as const

export const HEALTH_CONDITION_TYPES = [
  'Alergia',
  'Asma',
  'Condición cardiaca',
  'Diabetes',
  'Epilepsia',
  'Medicación permanente',
  'Restricción alimentaria',
  'Otra',
] as const
