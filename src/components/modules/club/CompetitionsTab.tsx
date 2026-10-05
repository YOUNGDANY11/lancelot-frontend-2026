import { ListChecks, Pencil, Plus, Trash2, Trophy } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu, type RowAction } from '@/components/common/RowActionsMenu'
import { CallUpsSheet } from '@/components/modules/club/CallUpsSheet'
import { CompetencyFormDialog } from '@/components/modules/club/CompetencyFormDialog'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { useCompetitionsTabController } from '@/controllers/club/useCompetitionsTabController'
import type { Competency } from '@/types/competition'
import { formatDate } from '@/utils/formatDate'

export function CompetitionsTab() {
  const controller = useCompetitionsTabController()
  const { dialogs } = controller

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={Trophy}
        title="Selecciona una temporada"
        description="Las competencias pertenecen a una temporada. Créala o elígela en la barra superior."
      />
    )
  }

  const actionsFor = (competency: Competency): RowAction[] => [
    { label: 'Convocatoria', icon: ListChecks, onSelect: () => controller.openCallUps(competency) },
    ...(controller.canManage
      ? [
          { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(competency) },
          {
            label: 'Eliminar',
            icon: Trash2,
            destructive: true,
            onSelect: () => dialogs.openDelete(competency),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={`Competencias de ${controller.season?.name ?? 'la temporada'}${
          controller.categoryFilterName ? ` · ${controller.categoryFilterName}` : ''
        }.`}
      >
        {controller.canManage && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Crear competencia
          </Button>
        )}
      </TabToolbar>

      <DataTable
        caption="Competencias"
        rows={controller.competencies}
        getRowKey={(competency) => competency.id_competency}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Trophy}
            title="Aún no hay competencias en esta temporada"
            description="Registra las ligas o torneos en los que participa el club."
            action={
              controller.canManage && (
                <Button onClick={dialogs.openCreate}>Crear competencia</Button>
              )
            }
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Competencia',
            cell: (competency) => <span className="font-medium">{competency.name}</span>,
          },
          {
            key: 'category',
            header: 'Categoría',
            cell: (competency) => controller.categoryName(competency.id_category),
          },
          {
            key: 'start',
            header: 'Inicio',
            cell: (competency) => formatDate(competency.start_date),
          },
          {
            key: 'finish',
            header: 'Fin',
            cell: (competency) =>
              competency.finish_date ? formatDate(competency.finish_date) : 'Sin definir',
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (competency) => (
              <RowActionsMenu subject={competency.name} actions={actionsFor(competency)} />
            ),
          },
        ]}
      />

      <CompetencyFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        competency={dialogs.editing}
        onClose={dialogs.close}
      />
      <CallUpsSheet competency={controller.callUpCompetency} onClose={controller.closeCallUps} />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la competencia ${dialogs.deleting?.name ?? ''}?`}
        description="Esta acción no se puede deshacer. Si tiene partidos o convocados, el sistema no permitirá eliminarla."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
