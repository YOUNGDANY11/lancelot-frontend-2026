import { describe, expect, it } from 'vitest'
import type { RunNowResult } from '@/types/ml'
import { describeRunSteps } from '@/utils/runAnalysis'

const RESULT: RunNowResult = {
  mensaje: 'ok',
  date: '2026-10-18',
  duration_ms: 1840,
  fatigue_alerts: { athletes: 20, created: 2, updated: 1, removed: 0, failed: 0 },
  risk_assessments: { athletes: 20, created: 0, updated: 0, removed: 0, failed: 0 },
  snapshot: { athletes: 20, snapshots: 18, failed: 0 },
  inference: { engine: 'rules', predicted: 0, assessments_created: 0, failed: 0 },
  labels: { error: 'Sin conexión con la base' },
  talent_dataset: { rows: 40, labeled: 20, promoted: 1, pending: 20, excluded: 0 },
  open_today: { fatigue_alerts: 3, risk_assessments: 0 },
}

describe('resumen del análisis inmediato', () => {
  it('describe cada paso en lenguaje del club', () => {
    const steps = describeRunSteps(RESULT)
    expect(steps.map((step) => step.detail)).toEqual([
      '2 alertas nuevas, 1 actualizada',
      'Sin cambios en 20 deportistas',
      '18 deportistas',
      'Motor en «Solo reglas»: se usaron solo las reglas',
      'Sin conexión con la base',
      '40 temporadas-deportista, 1 ascenso real',
    ])
    expect(steps.filter((step) => !step.ok).map((step) => step.label)).toEqual([
      'Etiquetado de días anteriores',
    ])
  })

  it('muestra las predicciones cuando el modelo de riesgo está activo', () => {
    const steps = describeRunSteps({
      ...RESULT,
      inference: { engine: 'shadow', predicted: 18, assessments_created: 0, failed: 0 },
    })
    expect(steps[3].detail).toBe('18 predicciones, 0 evaluaciones nuevas')
  })
})
