import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { MatchFormDialog } from '@/components/modules/club/MatchFormDialog'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { useMatchesTabController } from '@/controllers/club/useMatchesTabController'
import { formatDate } from '@/utils/formatDate'

export function MatchesTab() {
  const controller = useMatchesTabController()
  const { dialogs } = controller

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Selecciona una temporada"
        description="Los partidos pertenecen a las competencias de una temporada."
      />
    )
  }

  const canCreate = controller.canManage && controller.hasCompetencies

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={
          controller.hasCompetencies || controller.isLoading
            ? `Partidos de las competencias de ${controller.season?.name ?? 'la temporada'}. El RPE de cada partido se registra en Entrenamiento.`
            : 'Para programar partidos, primero crea una competencia en la pestaña Competencias.'
        }
      >
        {canCreate && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Programar partido
          </Button>
        )}
      </TabToolbar>

      <DataTable
        caption="Partidos"
        rows={controller.matches}
        getRowKey={(match) => match.id_match}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={CalendarClock}
            title="Aún no hay partidos programados"
            action={canCreate && <Button onClick={dialogs.openCreate}>Programar partido</Button>}
          />
        }
        columns={[
          {
            key: 'date',
            header: 'Fecha',
            cell: (match) => (
              <span className="font-medium tabular-nums">
                {formatDate(match.date)} · {match.time.slice(0, 5)}
              </span>
            ),
          },
          {
            key: 'competency',
            header: 'Competencia',
            cell: (match) => match.name_competency ?? '—',
          },
          { key: 'category', header: 'Categoría', cell: (match) => match.name_category ?? '—' },
          { key: 'location', header: 'Lugar', cell: (match) => match.location },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (match) => (
              <RowActionsMenu
                subject={`el partido del ${formatDate(match.date)}`}
                actions={
                  controller.canManage
                    ? [
                        { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(match) },
                        {
                          label: 'Eliminar',
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => dialogs.openDelete(match),
                        },
                      ]
                    : []
                }
              />
            ),
          },
        ]}
      />

      <MatchFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        match={dialogs.editing}
        onClose={dialogs.close}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar el partido del ${dialogs.deleting ? formatDate(dialogs.deleting.date) : ''}?`}
        description="Esta acción no se puede deshacer. Si el partido tiene estadísticas registradas, el sistema no permitirá eliminarlo."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
