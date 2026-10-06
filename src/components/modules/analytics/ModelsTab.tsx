import { BrainCircuit, CircleAlert, Power } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { useModelsTabController } from '@/controllers/analytics/useModelsTabController'
import type { MlModel } from '@/types/ml'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

const METRICS: { key: keyof MlModel['metrics']; label: string; digits: number }[] = [
  { key: 'pr_auc', label: 'PR-AUC', digits: 3 },
  { key: 'roc_auc', label: 'ROC-AUC', digits: 3 },
  { key: 'recall', label: 'Sensibilidad', digits: 3 },
  { key: 'precision', label: 'Precisión', digits: 3 },
  { key: 'brier', label: 'Brier', digits: 3 },
  { key: 'n_test', label: 'Casos de prueba', digits: 0 },
  { key: 'positives_test', label: 'Positivos de prueba', digits: 0 },
]

function PrAucComparison({ model }: { model: MlModel }) {
  const modelValue = model.metrics.pr_auc ?? null
  const rulesValue = model.rules_baseline_metrics?.pr_auc ?? null
  if (modelValue === null || rulesValue === null) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin PR-AUC de las reglas en el mismo conjunto de prueba: no se puede comparar.
      </p>
    )
  }
  const rows = [
    { label: 'Modelo', value: modelValue, className: 'bg-chart-1' },
    { label: 'Reglas', value: rulesValue, className: 'bg-chart-5' },
  ]
  const beats = modelValue > rulesValue

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium text-muted-foreground">
        PR-AUC frente a las reglas en el mismo conjunto de prueba
      </figcaption>
      <dl className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[4rem_minmax(0,1fr)_3rem] items-center gap-2 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className={`h-full rounded-full ${row.className}`}
                style={{ width: `${Math.min(100, row.value * 100)}%` }}
              />
            </dd>
            <dd className="text-right tabular-nums">{formatNumber(row.value, 3)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {beats
          ? 'El modelo supera a las reglas en este conjunto de prueba.'
          : 'El modelo no supera a las reglas: no se puede activar.'}
      </p>
    </figure>
  )
}

export function ModelsTab() {
  const controller = useModelsTabController()

  if (controller.isLoading)
    return <LoadingSkeleton variant="cards" rows={2} label="Cargando modelos" />
  if (controller.errorMessage)
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-pretty text-muted-foreground">
        Los modelos los entrena el servicio de ML y se registran aquí. Para activarlos deben ser
        reales (no sintéticos), cumplirse la readiness y superar a las reglas.
      </p>

      {controller.models.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="Aún no hay modelos registrados"
          description="Cuando haya datos suficientes, el servicio de ML registrará aquí sus modelos entrenados."
        />
      ) : (
        <ul aria-label="Modelos de ML" className="grid gap-4 xl:grid-cols-2">
          {controller.models.map((model) => {
            const rejection = controller.rejectionFor(model)
            return (
              <li key={model.id_model}>
                <article
                  aria-labelledby={`modelo-${model.id_model}`}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 id={`modelo-${model.id_model}`} className="font-semibold">
                        {model.version}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {model.algorithm} · variables {model.feature_version} · entrenado del{' '}
                        {formatDate(model.train_from)} al {formatDate(model.train_to)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {model.is_active && <StatusBadge label="Activo" tone="success" />}
                      {model.is_synthetic && <StatusBadge label="Sintético" tone="warning" />}
                    </div>
                  </header>

                  <dl className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {METRICS.map((metric) => (
                      <div key={metric.key} className="flex flex-col">
                        <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                        <dd className="font-semibold tabular-nums">
                          {formatNumber(model.metrics[metric.key], metric.digits)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <PrAucComparison model={model} />

                  {model.is_synthetic && (
                    <p className="text-xs text-muted-foreground">
                      Un modelo sintético solo sirve para probar el flujo y nunca se puede activar.
                    </p>
                  )}
                  {rejection && (
                    <p
                      role="alert"
                      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
                    >
                      <CircleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-destructive"
                      />
                      {rejection}
                    </p>
                  )}

                  {controller.canActivate && !model.is_active && (
                    <Button
                      variant="outline"
                      className="self-start"
                      onClick={() => controller.askActivate(model)}
                    >
                      <Power aria-hidden="true" />
                      Activar
                    </Button>
                  )}
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={controller.activating !== null}
        onOpenChange={(open) => !open && controller.cancelActivate()}
        title={`¿Activar el modelo ${controller.activating?.version ?? ''}?`}
        description="Reemplaza al modelo activo. El backend verifica que no sea sintético, que se cumpla la readiness y que supere a las reglas."
        confirmLabel="Activar"
        onConfirm={controller.activate}
        pending={controller.isActivating}
      />
    </div>
  )
}
