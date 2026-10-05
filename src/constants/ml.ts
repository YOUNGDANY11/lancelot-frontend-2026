export const READINESS_LABELS: Record<string, string> = {
  dias_etiquetados: 'Días con datos etiquetados',
  lesiones_sin_contacto: 'Lesiones sin contacto registradas',
  deportistas: 'Deportistas con datos',
}

export const ENGINE_MODE_DESCRIPTIONS = {
  rules: 'Las alertas salen solo de las reglas sobre la carga (RPE y ACWR).',
  shadow:
    'El modelo predice en segundo plano para compararlo con las reglas; las alertas siguen saliendo de las reglas.',
  ml: 'Las evaluaciones de riesgo incluyen las predicciones del modelo de aprendizaje automático.',
} as const
