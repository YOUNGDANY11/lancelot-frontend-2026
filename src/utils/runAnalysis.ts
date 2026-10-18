import { ML_ENGINE_MODE } from '@/constants/enums'
import type { DailyAlertsSummary, RunNowResult, StepError } from '@/types/ml'

export interface RunStep {
  label: string
  detail: string
  ok: boolean
}

function isError<T extends object>(value: T | StepError): value is StepError {
  return 'error' in value
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function alertsDetail(summary: DailyAlertsSummary, singular: string, pluralForm: string) {
  if (summary.created + summary.updated + summary.removed === 0)
    return `Sin cambios en ${plural(summary.athletes, 'deportista', 'deportistas')}`
  return [
    summary.created > 0 && plural(summary.created, `${singular} nueva`, `${pluralForm} nuevas`),
    summary.updated > 0 && plural(summary.updated, 'actualizada', 'actualizadas'),
    summary.removed > 0 && plural(summary.removed, 'retirada', 'retiradas'),
  ]
    .filter(Boolean)
    .join(', ')
}

export function describeRunSteps(result: RunNowResult): RunStep[] {
  const { inference } = result
  return [
    {
      label: 'Alertas de fatiga (ACWR)',
      ok: !isError(result.fatigue_alerts),
      detail: isError(result.fatigue_alerts)
        ? result.fatigue_alerts.error
        : alertsDetail(result.fatigue_alerts, 'alerta', 'alertas'),
    },
    {
      label: 'Reglas de riesgo de lesión',
      ok: !isError(result.risk_assessments),
      detail: isError(result.risk_assessments)
        ? result.risk_assessments.error
        : alertsDetail(result.risk_assessments, 'evaluación', 'evaluaciones'),
    },
    {
      label: 'Variables del día para el modelo',
      ok: !isError(result.snapshot),
      detail: isError(result.snapshot)
        ? result.snapshot.error
        : plural(result.snapshot.snapshots, 'deportista', 'deportistas'),
    },
    {
      label: 'Modelo de riesgo de lesión',
      ok: !isError(inference),
      detail: isError(inference)
        ? inference.error
        : inference.engine === 'rules'
          ? `Motor en «${ML_ENGINE_MODE.labels.rules}»: se usaron solo las reglas`
          : inference.skipped_reason && inference.predicted === 0
            ? inference.skipped_reason
            : `${plural(inference.predicted, 'predicción', 'predicciones')}, ${plural(inference.assessments_created, 'evaluación nueva', 'evaluaciones nuevas')}`,
    },
    {
      label: 'Etiquetado de días anteriores',
      ok: !isError(result.labels),
      detail: isError(result.labels)
        ? result.labels.error
        : `${plural(result.labels.processed, 'día-deportista', 'días-deportista')}, ${plural(result.labels.labeled_positive, 'con lesión sin contacto', 'con lesión sin contacto')}`,
    },
    {
      label: 'Dataset de talento',
      ok: !isError(result.talent_dataset),
      detail: isError(result.talent_dataset)
        ? result.talent_dataset.error
        : `${plural(result.talent_dataset.rows, 'temporada-deportista', 'temporadas-deportista')}, ${plural(result.talent_dataset.promoted, 'ascenso real', 'ascensos reales')}`,
    },
  ]
}
