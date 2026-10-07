import { TriangleAlert } from 'lucide-react'
import { DateRangeFields } from '@/components/common/DateRangeFields'
import { ErrorState } from '@/components/common/ErrorState'
import { KpiCard } from '@/components/common/KpiCard'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useDataQualityTabController } from '@/controllers/analytics/useDataQualityTabController'
import { formatNumber, formatPercent } from '@/utils/formatNumber'
import { countLabel } from '@/utils/text'

export function DataQualityTab() {
  const controller = useDataQualityTabController()
  const { range, quality } = controller

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-pretty text-muted-foreground">
        Qué tan completos están los datos con los que se calculan las alertas y se entrenaría el
        modelo. Datos incompletos producen alertas menos confiables.
      </p>
      <DateRangeFields
        idPrefix="calidad"
        from={range.from}
        to={range.to}
        onFromChange={range.setFrom}
        onToChange={range.setTo}
        error={range.error}
      />

      {controller.isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} label="Calculando la calidad de datos" />
      ) : controller.errorMessage ? (
        <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
      ) : (
        quality && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard
                label="Lesiones sin mecanismo"
                value={formatNumber(quality.injuries.without_mechanism, 0)}
                hint={`${formatPercent(quality.injuries.without_mechanism_pct)} de ${countLabel(quality.injuries.total, 'lesión', 'lesiones')}`}
                helpTerm="nonContactInjury"
              />
              <KpiCard
                label="Partidos sin RPE"
                value={formatNumber(quality.matches.without_rpe, 0)}
                hint={`${formatPercent(quality.matches.without_rpe_pct)} de ${countLabel(quality.matches.total, 'partido', 'partidos')}`}
              />
              <KpiCard
                label="Días sin carga"
                value={formatPercent(quality.load_days.avg_days_without_load_pct)}
                hint="Promedio por deportista"
              />
              <KpiCard
                label="Deportistas con datos"
                value={formatNumber(quality.snapshots.athletes_with_data, 0)}
                hint={`${quality.snapshots.days_with_snapshot} de ${quality.period.days} días con registro`}
              />
            </div>

            {quality.warnings.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
                {quality.warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2">
                    <TriangleAlert
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-risk-medium"
                    />
                    {warning}
                  </li>
                ))}
              </ul>
            )}

            {controller.worst.length > 0 && (
              <section
                aria-labelledby="calidad-sin-carga"
                className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5"
              >
                <h3 id="calidad-sin-carga" className="text-base font-semibold">
                  Deportistas con más días sin carga registrada
                </h3>
                <table className="w-full text-sm">
                  <caption className="sr-only">Deportistas con más días sin carga</caption>
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th scope="col" className="pb-2 font-medium">
                        Deportista
                      </th>
                      <th scope="col" className="pb-2 font-medium">
                        Días con carga
                      </th>
                      <th scope="col" className="pb-2 font-medium">
                        Sin carga
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {controller.worst.map((row) => (
                      <tr key={row.id_user}>
                        <td className="py-2 font-medium">{row.name}</td>
                        <td className="py-2 tabular-nums">{row.days_with_load}</td>
                        <td className="py-2 tabular-nums">
                          {formatPercent(row.days_without_load_pct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )
      )}
    </div>
  )
}
