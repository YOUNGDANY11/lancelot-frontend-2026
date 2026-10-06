import type { Permission } from '@/constants/permissions'

export const READINESS_LABELS: Record<string, string> = {
  dias_etiquetados: 'Días con datos etiquetados',
  lesiones_sin_contacto: 'Lesiones sin contacto registradas',
  deportistas: 'Deportistas con datos',
}

export type AnalyticsTab = 'motor' | 'readiness' | 'calidad' | 'modelos' | 'validacion' | 'datos'

export const ANALYTICS_TABS: { value: AnalyticsTab; label: string; permission: Permission }[] = [
  { value: 'motor', label: 'Motor', permission: 'manageMlEngine' },
  { value: 'readiness', label: 'Readiness', permission: 'viewMlData' },
  { value: 'calidad', label: 'Calidad de datos', permission: 'viewMlData' },
  { value: 'modelos', label: 'Modelos', permission: 'viewMlData' },
  { value: 'validacion', label: 'Validación', permission: 'viewValidation' },
  { value: 'datos', label: 'Datos', permission: 'viewMlData' },
]

export const LABEL_QUALITY_LABELS = {
  pending: 'Pendiente (faltan días)',
  labeled: 'Etiquetado',
  unknown_mechanism: 'Mecanismo desconocido',
} as const

export const CALIBRATION_WARNING =
  'Estos umbrales son un punto de partida: deben calibrarse con los datos del club.'

export const ENGINE_MODE_DESCRIPTIONS = {
  rules: 'Las alertas salen solo de las reglas sobre la carga (RPE y ACWR).',
  shadow:
    'El modelo predice en segundo plano para compararlo con las reglas; las alertas siguen saliendo de las reglas.',
  ml: 'Las evaluaciones de riesgo incluyen las predicciones del modelo de aprendizaje automático.',
} as const
