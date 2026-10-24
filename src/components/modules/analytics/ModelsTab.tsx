import { BrainCircuit, CircleAlert, GraduationCap, Power, PowerOff, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { PaginationNav } from '@/components/common/PaginationNav'
import { RowActionsMenu, type RowAction } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ViewModeToggle } from '@/components/common/ViewModeToggle'
import { Button } from '@/components/ui/button'
import { ML_MODEL_TASK } from '@/constants/enums'
import {
  type ModelAction,
  useModelsTabController,
} from '@/controllers/analytics/useModelsTabController'
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

const CONFIRMATIONS: Record<
  ModelAction,
  { label: string; description: (model: MlModel) => string; destructive?: boolean }
> = {
  activate: {
    label: 'Activar',
    description: () =>
      'Reemplaza al modelo activo. El backend verifica que no sea sintético, que se cumpla la readiness y que supere a las reglas.',
  },
  deactivate: {
    label: 'Desactivar',
    description: (model) =>
      `El motor de ${ML_MODEL_TASK.labels[model.task].toLowerCase()} vuelve a «Solo reglas» si estaba en modo sombra o aprendizaje automático.`,
  },
  delete: {
    label: 'Eliminar',
    description: () =>
      'Se eliminan el modelo, sus predicciones guardadas y su archivo en el servicio de ML. Esta acción no se puede deshacer.',
    destructive: true,
  },
}

const ACTION_ICONS = { activate: Power, deactivate: PowerOff, delete: Trash2 }

function availableActions(model: MlModel): ModelAction[] {
  return model.is_active ? ['deactivate'] : ['activate', 'delete']
}

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

function ModelStatus({ model }: { model: MlModel }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge
        label={ML_MODEL_TASK.labels[model.task]}
        tone={ML_MODEL_TASK.tones[model.task]}
      />
      {model.is_active && <StatusBadge label="Activo" tone="success" />}
      {model.is_synthetic && <StatusBadge label="Sintético" tone="warning" />}
    </div>
  )
}

function RejectionAlert({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
      {message}
    </p>
  )
}

export function ModelsTab() {
  const controller = useModelsTabController()

  if (controller.isLoading)
    return <LoadingSkeleton variant="cards" rows={2} label="Cargando modelos" />
  if (controller.errorMessage)
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />

  const { pagination, confirming } = controller
  const confirmation = confirming ? CONFIRMATIONS[confirming.action] : null
  const rowActions = (model: MlModel): RowAction[] =>
    availableActions(model).map((action) => ({
      label: CONFIRMATIONS[action].label,
      icon: ACTION_ICONS[action],
      destructive: CONFIRMATIONS[action].destructive,
      onSelect: () => controller.ask(action, model),
    }))

  const columns: DataTableColumn<MlModel>[] = [
    {
      key: 'version',
      header: 'Versión',
      cell: (model) => (
        <div className="flex flex-col">
          <span className="font-medium">{model.version}</span>
          <span className="text-xs text-muted-foreground">
            {model.algorithm} · variables {model.feature_version}
          </span>
        </div>
      ),
    },
    { key: 'status', header: 'Estado', cell: (model) => <ModelStatus model={model} /> },
    {
      key: 'pr_auc',
      header: 'PR-AUC',
      className: 'text-right tabular-nums',
      cell: (model) => formatNumber(model.metrics.pr_auc, 3),
    },
    {
      key: 'rules',
      header: 'PR-AUC reglas',
      className: 'text-right tabular-nums',
      cell: (model) => formatNumber(model.rules_baseline_metrics?.pr_auc, 3),
    },
    {
      key: 'n_test',
      header: 'Casos de prueba',
      className: 'text-right tabular-nums',
      cell: (model) => formatNumber(model.metrics.n_test, 0),
    },
    {
      key: 'trained',
      header: 'Entrenado',
      cell: (model) => `${formatDate(model.train_from)} – ${formatDate(model.train_to)}`,
    },
    ...(controller.canManage
      ? [
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12',
            cell: (model: MlModel) => (
              <RowActionsMenu subject={model.version} actions={rowActions(model)} />
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-pretty text-muted-foreground">
        Los modelos los entrena el servicio de ML y se registran aquí: uno de riesgo de lesión y
        otro de talento. Para activarlos deben ser reales (no sintéticos), cumplirse la readiness de
        su tarea y superar a las reglas. Activar uno solo reemplaza al activo de su misma tarea.
      </p>

      {controller.canManage && (
        <section
          aria-labelledby="entrenar-modelos"
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div>
            <h3 id="entrenar-modelos" className="font-semibold">
              Entrenar con los datos actuales
            </h3>
            <p className="text-xs text-pretty text-muted-foreground">
              El servicio de ML verifica la readiness, entrena con los datos de la base y registra
              el modelo sin activarlo. Puede tardar unos minutos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ML_MODEL_TASK.options.map((task) => (
              <Button
                key={task.value}
                variant="outline"
                disabled={controller.trainingTask !== null}
                onClick={() => controller.train(task.value)}
              >
                <GraduationCap aria-hidden="true" />
                {controller.trainingTask === task.value
                  ? 'Entrenando…'
                  : `Entrenar modelo de ${task.label.toLowerCase()}`}
              </Button>
            ))}
          </div>
        </section>
      )}

      {controller.models.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="Aún no hay modelos registrados"
          description={
            controller.canManage
              ? 'Entrena un modelo cuando se cumpla la readiness de su tarea y aparecerá aquí.'
              : 'Cuando haya datos suficientes, el servicio de ML registrará aquí sus modelos entrenados.'
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {pagination?.total ?? controller.models.length} modelos registrados
            </p>
            <ViewModeToggle value={controller.viewMode} onChange={controller.setViewMode} />
          </div>

          {controller.viewMode === 'table' ? (
            <>
              {controller.rejection && (
                <RejectionAlert
                  message={`${controller.rejection.version}: ${controller.rejection.message}`}
                />
              )}
              <DataTable
                caption="Modelos de ML"
                columns={columns}
                rows={controller.models}
                getRowKey={(model) => model.id_model}
                pagination={pagination}
                onPageChange={controller.setPage}
              />
            </>
          ) : (
            <>
              <ul aria-label="Modelos de ML" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {controller.models.map((model) => {
                  const rejection = controller.rejectionFor(model)
                  return (
                    <li key={model.id_model}>
                      <article
                        aria-labelledby={`modelo-${model.id_model}`}
                        className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4"
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
                          <ModelStatus model={model} />
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
                            Un modelo sintético solo sirve para probar el flujo y nunca se puede
                            activar.
                          </p>
                        )}
                        {rejection && <RejectionAlert message={rejection} />}

                        {controller.canManage && (
                          <div className="mt-auto flex flex-wrap gap-2">
                            {availableActions(model).map((action) => {
                              const Icon = ACTION_ICONS[action]
                              return (
                                <Button
                                  key={action}
                                  variant={
                                    CONFIRMATIONS[action].destructive ? 'destructive' : 'outline'
                                  }
                                  onClick={() => controller.ask(action, model)}
                                >
                                  <Icon aria-hidden="true" />
                                  {CONFIRMATIONS[action].label}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      </article>
                    </li>
                  )
                })}
              </ul>
              {pagination && pagination.totalPages > 1 && (
                <PaginationNav
                  label="Paginación de modelos de ML"
                  pagination={pagination}
                  onPageChange={controller.setPage}
                  itemsLabel="modelos"
                />
              )}
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && controller.cancel()}
        title={`¿${confirmation?.label ?? ''} el modelo ${confirming?.model.version ?? ''}?`}
        description={confirming && confirmation ? confirmation.description(confirming.model) : ''}
        confirmLabel={confirmation?.label ?? ''}
        onConfirm={controller.confirm}
        pending={controller.isPending}
        destructive={confirmation?.destructive}
      />
    </div>
  )
}
