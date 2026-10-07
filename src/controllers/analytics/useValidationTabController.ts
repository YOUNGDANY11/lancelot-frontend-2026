import { useQuery } from '@tanstack/react-query'
import { TALENT_FLAG_SOURCE, type TalentFlagSource } from '@/constants/enums'
import { useAppContext } from '@/hooks/useAppContext'
import { useDateRange } from '@/hooks/useDateRange'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import type { ValidationReport } from '@/types/ml'
import { parseApiError } from '@/utils/parseApiError'
import { countLabel } from '@/utils/text'

export interface ValidationKpi {
  key: string
  label: string
  value: number | null
  detail: string
  definition?: string
}

function buildKpis(report: ValidationReport): ValidationKpi[] {
  const { rules_phase1: rules, definitions } = report
  const kpis: ValidationKpi[] = [
    {
      key: 'fatigue-dismissal',
      label: 'Descarte de alertas de fatiga',
      value: report.fatigue_alerts.dismissal_rate,
      detail: `${countLabel(report.fatigue_alerts.total, 'alerta', 'alertas')} en el periodo`,
      definition: definitions.dismissal_rate,
    },
    {
      key: 'risk-dismissal',
      label: 'Descarte de evaluaciones de riesgo',
      value: report.injury_risk_assessments.dismissal_rate,
      detail: `${countLabel(report.injury_risk_assessments.total, 'evaluación', 'evaluaciones')} en el periodo`,
      definition: definitions.dismissal_rate,
    },
    {
      key: 'sensitivity',
      label: 'Sensibilidad de las reglas',
      value: rules.sensitivity.sensitivity,
      detail: `${rules.sensitivity.preceded_by_alert} de ${rules.sensitivity.injuries} lesiones sin contacto fueron anticipadas`,
      definition: definitions.sensitivity,
    },
    {
      key: 'ppv',
      label: 'Valor predictivo de las reglas',
      value: rules.positive_predictive_value.positive_predictive_value,
      detail: `${rules.positive_predictive_value.followed_by_injury} de ${rules.positive_predictive_value.alerts} alertas seguidas de lesión · ${rules.positive_predictive_value.pending_window} aún en ventana`,
      definition: definitions.positive_predictive_value,
    },
  ]
  for (const [source, summary] of Object.entries(report.talent)) {
    const label =
      source in TALENT_FLAG_SOURCE.labels
        ? TALENT_FLAG_SOURCE.labels[source as TalentFlagSource]
        : source
    kpis.push({
      key: `talent-${source}`,
      label: `Aceptación de talento · ${label}`,
      value: summary.acceptance_rate,
      detail: countLabel(summary.total, 'señalización', 'señalizaciones'),
      definition: definitions.acceptance_rate,
    })
  }
  kpis.push({
    key: 'agreement',
    label: 'Concordancia ML / reglas',
    value: report.shadow_mode?.agreement.agreement ?? null,
    detail: report.shadow_mode
      ? `${report.shadow_mode.agreement.compared} días-deportista comparados`
      : 'Sin predicciones del modelo en el periodo',
    definition: definitions.agreement,
  })
  return kpis
}

export function useValidationTabController() {
  const { activeSeason } = useAppContext()
  const range = useDateRange(90, activeSeason?.start_date)
  const params = { from: range.from, to: range.to }

  const query = useQuery({
    queryKey: queryKeys.ml.validation(params),
    queryFn: () => mlService.validationReport(params),
    enabled: range.isValid,
  })
  const report = query.data

  return {
    range,
    report,
    kpis: report ? buildKpis(report) : [],
    isLoading: range.isValid && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
