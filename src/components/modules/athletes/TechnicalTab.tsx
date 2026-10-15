import { ArrowDown, ArrowUp, Minus, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { TabSection } from '@/components/modules/athletes/TabSection'
import { TechnicalEvaluationFormDialog } from '@/components/modules/athletes/TechnicalEvaluationFormDialog'
import { Button } from '@/components/ui/button'
import { useTechnicalTabController } from '@/controllers/athletes/useTechnicalTabController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'
import { dimensionOf, type IndicatorSummary } from '@/utils/technicalScores'
import { EVALUATION_DIMENSION } from '@/constants/enums'
import { DELETED_ACCOUNT_LABEL } from '@/constants/roles'

function TrendBadge({ summary }: { summary: IndicatorSummary }) {
  if (summary.previous === null) return null
  const delta = summary.latest - summary.previous
  const Icon = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus
  const label =
    delta > 0
      ? `Sube ${formatNumber(delta, 1)}`
      : delta < 0
        ? `Baja ${formatNumber(Math.abs(delta), 1)}`
        : 'Sin cambio'
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  )
}

export function TechnicalTab({ idUser }: { idUser: number }) {
  const controller = useTechnicalTabController(idUser)
  const { dialogs } = controller

  if (controller.isLoading) return <LoadingSkeleton variant="list" />
  if (controller.errorMessage) {
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
  }

  return (
    <TabSection
      description="Puntajes de 1 a 10 por habilidad técnica y por comprensión táctica del juego. Se muestra el último de cada indicador."
      action={
        controller.canCreate && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Registrar evaluación
          </Button>
        )
      }
    >
      {controller.indicators.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Aún no hay evaluaciones técnicas ni tácticas"
          action={
            controller.canCreate && (
              <Button onClick={dialogs.openCreate}>Registrar evaluación</Button>
            )
          }
        />
      ) : (
        <>
          {controller.groups.map((group) => (
            <section key={group.dimension} className="flex flex-col gap-3">
              <h3 className="text-base font-semibold">{group.label}</h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.items.map((summary) => (
                  <li
                    key={`${summary.dimension}-${summary.indicator}`}
                    className="flex flex-col gap-2 rounded-xl glass-subtle p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{summary.indicator}</span>
                      <span className="font-heading text-xl font-semibold tabular-nums">
                        {formatNumber(summary.latest, 1)}
                        <span className="text-sm text-muted-foreground"> / 10</span>
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${summary.indicator}: ${formatNumber(summary.latest, 1)} de 10`}
                    >
                      <div
                        className="h-full rounded-full bg-chart-1"
                        style={{ width: `${(summary.latest / 10) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDate(summary.date)} · {summary.count}{' '}
                        {summary.count === 1 ? 'evaluación' : 'evaluaciones'}
                      </span>
                      <TrendBadge summary={summary} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <DataTable
            caption="Historial de evaluaciones técnicas y tácticas"
            rows={controller.evaluations}
            getRowKey={(evaluation) => evaluation.id_eval_tech}
            columns={[
              {
                key: 'date',
                header: 'Fecha',
                cell: (evaluation) => formatDate(evaluation.eval_date),
              },
              {
                key: 'dimension',
                header: 'Dimensión',
                cell: (evaluation) => EVALUATION_DIMENSION.labels[dimensionOf(evaluation)],
              },
              { key: 'indicator', header: 'Indicador', cell: (evaluation) => evaluation.indicator },
              {
                key: 'score',
                header: 'Puntaje',
                cell: (evaluation) => (
                  <span className="tabular-nums">{formatNumber(evaluation.score, 1)}</span>
                ),
              },
              {
                key: 'evaluator',
                header: 'Evaluó',
                cell: (evaluation) => evaluation.evaluator_name || DELETED_ACCOUNT_LABEL,
              },
              {
                key: 'actions',
                header: <span className="sr-only">Acciones</span>,
                className: 'w-12 text-right',
                cell: (evaluation) => (
                  <RowActionsMenu
                    subject={`${evaluation.indicator} del ${formatDate(evaluation.eval_date)}`}
                    actions={
                      controller.canManage
                        ? [
                            {
                              label: 'Editar',
                              icon: Pencil,
                              onSelect: () => dialogs.openEdit(evaluation),
                            },
                            {
                              label: 'Eliminar',
                              icon: Trash2,
                              destructive: true,
                              onSelect: () => dialogs.openDelete(evaluation),
                            },
                          ]
                        : []
                    }
                  />
                ),
              },
            ]}
          />
        </>
      )}

      <TechnicalEvaluationFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        idUser={idUser}
        evaluation={dialogs.editing}
        knownIndicators={controller.indicators.map((summary) => summary.indicator)}
        sport={controller.sport}
        onClose={dialogs.close}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la evaluación de ${dialogs.deleting?.indicator ?? ''}?`}
        description="Esta acción no se puede deshacer y afecta el índice de progreso de la temporada."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </TabSection>
  )
}
