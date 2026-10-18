import { CircleCheck, Hourglass } from 'lucide-react'
import { ReadinessProgress } from '@/components/charts/ReadinessProgress'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { KpiCard } from '@/components/common/KpiCard'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useReadinessTabController } from '@/controllers/analytics/useReadinessTabController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

export function ReadinessTab() {
  const controller = useReadinessTabController()
  const { readiness } = controller

  if (controller.isLoading) return <LoadingSkeleton rows={3} label="Consultando la readiness" />
  if (controller.errorMessage || !readiness)
    return (
      <ErrorState
        message={controller.errorMessage ?? 'No pudimos consultar la readiness.'}
        onRetry={controller.retry}
      />
    )

  return (
    <div className="flex flex-col gap-5">
      <div
        className={
          readiness.ready
            ? 'flex items-start gap-3 rounded-2xl border border-risk-low/40 bg-risk-low/10 p-4'
            : 'flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4'
        }
      >
        {readiness.ready ? (
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-risk-low" />
        ) : (
          <Hourglass aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="flex flex-col gap-1 text-sm">
          <p className="flex items-center gap-1 font-semibold">
            {readiness.ready
              ? 'Hay datos suficientes para entrenar un modelo'
              : 'Aún no hay datos suficientes para el modelo'}
            <HelpHint term="readiness" />
          </p>
          <p className="text-pretty text-muted-foreground">
            {readiness.ready
              ? 'Ya se puede entrenar un modelo y, si supera a las reglas, activarlo en modo sombra.'
              : `Faltan ${controller.pendingCount} de ${readiness.criteria.length} criterios. Mientras tanto, el sistema sigue con las reglas sobre la carga, que funcionan desde el primer día.`}
          </p>
        </div>
      </div>

      <section
        aria-labelledby="readiness-criterios"
        className="rounded-2xl glass-subtle p-4 sm:p-5"
      >
        <h3 id="readiness-criterios" className="mb-4 text-base font-semibold">
          Criterios frente al mínimo
        </h3>
        <ReadinessProgress criteria={readiness.criteria} />
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiCard
          label="Días-deportista etiquetados"
          value={formatNumber(readiness.labeled_rows, 0)}
        />
        <KpiCard
          label="Casos positivos"
          value={formatNumber(readiness.positive_labels, 0)}
          hint="Lesiones sin contacto en los 7 días siguientes"
        />
        <KpiCard
          label="Periodo etiquetado"
          value={
            readiness.labeled_period.from
              ? `${formatDate(readiness.labeled_period.from)} – ${formatDate(readiness.labeled_period.to)}`
              : 'Sin datos'
          }
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {controller.showTalent && (
        <section aria-labelledby="readiness-talento" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 id="readiness-talento" className="flex items-center gap-1 text-base font-semibold">
              Readiness del modelo de talento
              <HelpHint term="talentDetection" />
            </h3>
            <p className="text-sm text-pretty text-muted-foreground">
              El modelo de talento aprende de los ascensos reales: deportistas que la temporada
              siguiente juegan en una categoría superior a la de su edad. Necesita al menos una
              temporada etiquetada para entrenar y otra para probar.
            </p>
          </div>
          {controller.talentErrorMessage ? (
            <ErrorState message={controller.talentErrorMessage} onRetry={controller.retryTalent} />
          ) : !controller.talentReadiness ? (
            <LoadingSkeleton rows={2} label="Consultando la readiness de talento" />
          ) : (
            <>
              <p className="text-sm font-medium">
                {controller.talentReadiness.ready
                  ? 'Hay datos suficientes para entrenar un modelo de talento.'
                  : `Faltan ${controller.talentPendingCount} de ${controller.talentReadiness.criteria.length} criterios. Mientras tanto, la detección de talento sigue con las reglas.`}
              </p>
              <div className="rounded-2xl glass-subtle p-4 sm:p-5">
                <ReadinessProgress criteria={controller.talentReadiness.criteria} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <KpiCard
                  label="Temporadas-deportista etiquetadas"
                  value={formatNumber(controller.talentReadiness.labeled_rows, 0)}
                />
                <KpiCard
                  label="Pendientes de etiqueta"
                  value={formatNumber(controller.talentReadiness.pending_rows, 0)}
                  hint="Se etiquetan cuando la temporada siguiente tiene plantilla"
                />
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
