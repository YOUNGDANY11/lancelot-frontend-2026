import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PhysicalTimelineChart } from '@/components/charts/PhysicalTimelineChart'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { PhysicalEvaluationFormSheet } from '@/components/modules/athletes/PhysicalEvaluationFormSheet'
import { TabSection } from '@/components/modules/athletes/TabSection'
import { Button } from '@/components/ui/button'
import { PHYSICAL_EVALUATION_STAGE, VO2_TEST_METHOD } from '@/constants/enums'
import { usePhysicalTabController } from '@/controllers/athletes/usePhysicalTabController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

export function PhysicalTab({ idUser }: { idUser: number }) {
  const controller = usePhysicalTabController(idUser)
  const { dialogs } = controller

  if (controller.isLoading) return <LoadingSkeleton variant="table" />
  if (controller.errorMessage) {
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
  }

  return (
    <TabSection
      description="Talla, peso, VO₂ máx. y velocidad en cada etapa de la temporada."
      action={
        controller.canCreate && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Registrar evaluación física
          </Button>
        )
      }
    >
      <PhysicalTimelineChart evaluations={controller.evaluations} />
      {controller.evaluations.length > 0 && (
        <DataTable
          caption="Evaluaciones físicas"
          rows={[...controller.evaluations].reverse()}
          getRowKey={(evaluation) => evaluation.id_eval}
          columns={[
            {
              key: 'date',
              header: 'Fecha',
              cell: (evaluation) => (
                <span className="font-medium">{formatDate(evaluation.eval_date)}</span>
              ),
            },
            {
              key: 'stage',
              header: 'Etapa',
              cell: (evaluation) => PHYSICAL_EVALUATION_STAGE.labels[evaluation.stage],
            },
            {
              key: 'body',
              header: 'Talla / peso',
              cell: (evaluation) =>
                `${formatNumber(evaluation.height_cm, 1)} cm · ${formatNumber(evaluation.weight_kg, 1)} kg`,
            },
            {
              key: 'vo2',
              header: 'VO₂ máx.',
              cell: (evaluation) =>
                evaluation.vo2max_estimado
                  ? `${formatNumber(evaluation.vo2max_estimado, 1)}${
                      evaluation.test_method
                        ? ` (${VO2_TEST_METHOD.labels[evaluation.test_method]})`
                        : ''
                    }`
                  : '—',
            },
            {
              key: 'speed',
              header: '20 m',
              cell: (evaluation) =>
                evaluation.speed_20m ? `${formatNumber(evaluation.speed_20m, 2)} s` : '—',
            },
            {
              key: 'actions',
              header: <span className="sr-only">Acciones</span>,
              className: 'w-12 text-right',
              cell: (evaluation) => (
                <RowActionsMenu
                  subject={`la evaluación del ${formatDate(evaluation.eval_date)}`}
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
      )}

      <PhysicalEvaluationFormSheet
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        idUser={idUser}
        evaluation={dialogs.editing}
        onClose={dialogs.close}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la evaluación física del ${dialogs.deleting ? formatDate(dialogs.deleting.eval_date) : ''}?`}
        description="Esta acción no se puede deshacer y afecta el índice de progreso de la temporada."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </TabSection>
  )
}
