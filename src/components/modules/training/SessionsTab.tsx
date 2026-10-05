import { CalendarPlus, ClipboardList, Dumbbell, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { RpeLogSheet } from '@/components/modules/training/RpeLogSheet'
import { TrainingSessionFormDialog } from '@/components/modules/training/TrainingSessionFormDialog'
import { Button } from '@/components/ui/button'
import { TRAINING_SESSION_TYPE } from '@/constants/enums'
import { useSessionsTabController } from '@/controllers/training/useSessionsTabController'
import { formatDate } from '@/utils/formatDate'

export function SessionsTab() {
  const controller = useSessionsTabController()
  const { dialogs } = controller

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Selecciona una temporada"
        description="Las sesiones se programan dentro de una temporada."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={`Sesiones de ${controller.season?.name ?? 'la temporada'}${
          controller.categoryName ? ` · ${controller.categoryName}` : ''
        }. Después de cada sesión, registra el RPE de la plantilla.`}
      >
        {controller.canManage && (
          <Button onClick={dialogs.openCreate}>
            <CalendarPlus aria-hidden="true" />
            Programar sesión
          </Button>
        )}
      </TabToolbar>

      <DataTable
        caption="Sesiones de entrenamiento"
        rows={controller.sessions}
        getRowKey={(session) => session.id_session}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Dumbbell}
            title="Aún no hay sesiones en esta temporada"
            action={
              controller.canManage && <Button onClick={dialogs.openCreate}>Programar sesión</Button>
            }
          />
        }
        columns={[
          {
            key: 'date',
            header: 'Fecha',
            cell: (session) => (
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium tabular-nums">{formatDate(session.date)}</span>
                {controller.isToday(session) ? (
                  <StatusBadge label="Hoy" tone="info" />
                ) : controller.isThisWeek(session) ? (
                  <StatusBadge label="Esta semana" tone="neutral" />
                ) : null}
              </span>
            ),
          },
          {
            key: 'type',
            header: 'Tipo',
            cell: (session) => TRAINING_SESSION_TYPE.labels[session.type],
          },
          { key: 'category', header: 'Categoría', cell: (session) => session.category_name ?? '—' },
          {
            key: 'duration',
            header: 'Duración',
            cell: (session) => `${session.planned_duration_min} min`,
          },
          {
            key: 'rpe',
            header: <span className="sr-only">Registrar RPE</span>,
            className: 'text-right',
            cell: (session) =>
              controller.canManage && (
                <Button
                  size="sm"
                  variant={controller.isToday(session) ? 'default' : 'outline'}
                  onClick={() => controller.openRpeLog(session)}
                >
                  <ClipboardList aria-hidden="true" />
                  Registrar RPE
                </Button>
              ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (session) => (
              <RowActionsMenu
                subject={`la sesión del ${formatDate(session.date)}`}
                actions={
                  controller.canManage
                    ? [
                        {
                          label: 'Editar',
                          icon: Pencil,
                          onSelect: () => dialogs.openEdit(session),
                        },
                        {
                          label: 'Eliminar',
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => dialogs.openDelete(session),
                        },
                      ]
                    : []
                }
              />
            ),
          },
        ]}
      />

      <TrainingSessionFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        session={dialogs.editing}
        onClose={dialogs.close}
      />
      <RpeLogSheet session={controller.rpeSession} onClose={controller.closeRpeLog} />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la sesión del ${dialogs.deleting ? formatDate(dialogs.deleting.date) : ''}?`}
        description="Esta acción no se puede deshacer. Si la sesión tiene RPE registrado, el sistema no permitirá eliminarla."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
