import { TriangleAlert } from 'lucide-react'
import { ValidationKpis } from '@/components/charts/ValidationKpis'
import { DateRangeFields } from '@/components/common/DateRangeFields'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import {
  REVIEW_STATUS,
  RISK_LEVEL,
  type ReviewStatus,
  type RiskLevelValue,
} from '@/constants/enums'
import { useValidationTabController } from '@/controllers/analytics/useValidationTabController'
import type { StatusSummary } from '@/types/ml'

const LEVELS: RiskLevelValue[] = ['alto', 'medio', 'bajo']
const STATUSES: ReviewStatus[] = ['open', 'reviewed', 'dismissed']

function SummaryTable({ caption, summary }: { caption: string; summary: StatusSummary }) {
  return (
    <table className="w-full text-sm">
      <caption className="mb-2 text-left text-sm font-semibold">{caption}</caption>
      <thead>
        <tr className="text-left text-xs text-muted-foreground">
          <th scope="col" className="pb-1 font-medium">
            Nivel
          </th>
          <th scope="col" className="pb-1 font-medium">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {LEVELS.map((level) => (
          <tr key={level}>
            <th scope="row" className="py-1.5 text-left font-normal">
              {RISK_LEVEL.labels[level]}
            </th>
            <td className="py-1.5 tabular-nums">{summary.by_level[level] ?? 0}</td>
          </tr>
        ))}
        {STATUSES.map((status) => (
          <tr key={status}>
            <th scope="row" className="py-1.5 text-left font-normal text-muted-foreground">
              {REVIEW_STATUS.labels[status]}
            </th>
            <td className="py-1.5 text-muted-foreground tabular-nums">
              {summary.by_status[status] ?? 0}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ValidationTab() {
  const controller = useValidationTabController()
  const { range, report } = controller

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-pretty text-muted-foreground">
        Indicadores para validar el sistema con el club: qué tan útiles son las alertas, cuántas
        lesiones anticiparon y cómo se reciben las señalizaciones de talento.
      </p>
      <DateRangeFields
        idPrefix="validacion"
        from={range.from}
        to={range.to}
        onFromChange={range.setFrom}
        onToChange={range.setTo}
        error={range.error}
      />

      {controller.isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} label="Generando el reporte de validación" />
      ) : controller.errorMessage ? (
        <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
      ) : (
        report && (
          <>
            <ValidationKpis kpis={controller.kpis} />

            {report.warnings.length > 0 && (
              <section
                aria-labelledby="validacion-advertencias"
                className="flex flex-col gap-2 rounded-2xl border border-risk-medium/40 bg-risk-medium/10 p-4"
              >
                <h3 id="validacion-advertencias" className="text-sm font-semibold">
                  Advertencias
                </h3>
                <ul className="flex flex-col gap-1 text-sm">
                  {report.warnings.map((warning) => (
                    <li key={warning} className="flex items-start gap-2">
                      <TriangleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-risk-medium"
                      />
                      {warning}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="grid gap-4 rounded-2xl glass-subtle p-4 sm:grid-cols-2 sm:p-5">
              <SummaryTable caption="Alertas de fatiga" summary={report.fatigue_alerts} />
              <SummaryTable
                caption="Evaluaciones de riesgo"
                summary={report.injury_risk_assessments}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ventana de evaluación: {report.window_days} días. Lesiones sin contacto en el periodo:{' '}
              {report.rules_phase1.non_contact_injuries}. Lesiones sin mecanismo:{' '}
              {report.rules_phase1.injuries_without_mechanism}.
            </p>
          </>
        )
      )}
    </div>
  )
}
