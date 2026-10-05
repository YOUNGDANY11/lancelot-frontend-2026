import { CalendarPlus, CalendarRange, CirclePlay, Lock, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu, type RowAction } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SeasonEditDialog } from '@/components/modules/club/SeasonEditDialog'
import { SeasonFormDialog } from '@/components/modules/club/SeasonFormDialog'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { SEASON_STATUS } from '@/constants/enums'
import { useSeasonsTabController } from '@/controllers/club/useSeasonsTabController'
import type { Season } from '@/types/club'
import { formatDate } from '@/utils/formatDate'

export function SeasonsTab() {
  const controller = useSeasonsTabController()
  const { dialogs, statusChange } = controller

  const actionsFor = (season: Season): RowAction[] => {
    if (!controller.canManage) return []
    const actions: RowAction[] = [
      { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(season) },
    ]
    if (season.status === 'planned') {
      actions.push({
        label: 'Activar',
        icon: CirclePlay,
        onSelect: () => controller.requestStatusChange(season, 'active'),
      })
    }
    if (season.status !== 'closed') {
      actions.push({
        label: 'Cerrar temporada',
        icon: Lock,
        onSelect: () => controller.requestStatusChange(season, 'closed'),
      })
    }
    actions.push({
      label: 'Eliminar',
      icon: Trash2,
      destructive: true,
      onSelect: () => dialogs.openDelete(season),
    })
    return actions
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="La temporada activa es el contexto por defecto de toda la plataforma.">
        {controller.canManage && (
          <Button onClick={dialogs.openCreate}>
            <CalendarPlus aria-hidden="true" />
            Crear temporada
          </Button>
        )}
      </TabToolbar>

      <DataTable
        caption="Temporadas"
        rows={controller.seasons}
        getRowKey={(season) => season.id_season}
        isLoading={controller.isLoading}
        errorMessage={controller.isError ? 'No pudimos cargar las temporadas.' : undefined}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={CalendarRange}
            title="Aún no hay temporadas"
            description="Crea la primera temporada para empezar a registrar el trabajo del club."
            action={
              controller.canManage && <Button onClick={dialogs.openCreate}>Crear temporada</Button>
            }
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Temporada',
            cell: (season) => <span className="font-medium">{season.name}</span>,
          },
          { key: 'start', header: 'Inicio', cell: (season) => formatDate(season.start_date) },
          {
            key: 'end',
            header: 'Fin',
            cell: (season) => (season.end_date ? formatDate(season.end_date) : 'Sin definir'),
          },
          {
            key: 'status',
            header: 'Estado',
            cell: (season) => (
              <StatusBadge
                label={SEASON_STATUS.labels[season.status]}
                tone={SEASON_STATUS.tones[season.status]}
              />
            ),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (season) => <RowActionsMenu subject={season.name} actions={actionsFor(season)} />,
          },
        ]}
      />

      <SeasonFormDialog
        open={dialogs.isCreateOpen}
        onOpenChange={(open) => (open ? dialogs.openCreate() : dialogs.close())}
      />
      <SeasonEditDialog season={dialogs.editing} onClose={dialogs.close} />
      <ConfirmDialog
        open={statusChange !== null}
        onOpenChange={(open) => !open && controller.cancelStatusChange()}
        title={
          statusChange?.status === 'closed'
            ? `¿Cerrar la temporada ${statusChange.season.name}?`
            : `¿Activar la temporada ${statusChange?.season.name ?? ''}?`
        }
        description={
          statusChange?.status === 'closed'
            ? 'Al cerrarla, Lancelot recalcula los índices de progreso y ejecuta la detección automática de talento. Las señalizaciones quedarán pendientes para que el cuerpo técnico las revise.'
            : 'Pasará a ser la temporada por defecto para todas las personas del club.'
        }
        confirmLabel={statusChange?.status === 'closed' ? 'Cerrar temporada' : 'Activar'}
        onConfirm={controller.confirmStatusChange}
        pending={controller.isChangingStatus}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la temporada ${dialogs.deleting?.name ?? ''}?`}
        description="Esta acción no se puede deshacer. Si la temporada tiene registros asociados, el sistema no permitirá eliminarla."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
