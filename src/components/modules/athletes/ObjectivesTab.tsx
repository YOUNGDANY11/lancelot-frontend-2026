import { Flag, Pencil, Plus, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ObjectiveFormDialog } from '@/components/modules/athletes/ObjectiveFormDialog'
import { TabSection } from '@/components/modules/athletes/TabSection'
import { Button } from '@/components/ui/button'
import { DEVELOPMENT_OBJECTIVE_STATUS } from '@/constants/enums'
import { useObjectivesTabController } from '@/controllers/athletes/useObjectivesTabController'
import { formatDate } from '@/utils/formatDate'

export function ObjectivesTab({ idUser }: { idUser: number }) {
  const controller = useObjectivesTabController(idUser)
  const { dialogs } = controller

  if (controller.isLoading) return <LoadingSkeleton variant="list" rows={3} />
  if (controller.errorMessage) {
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
  }

  return (
    <TabSection
      description="Metas de desarrollo acordadas con el cuerpo técnico."
      action={
        controller.canCreate && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Crear objetivo
          </Button>
        )
      }
    >
      {controller.objectives.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="Aún no hay objetivos de desarrollo"
          action={
            controller.canCreate && <Button onClick={dialogs.openCreate}>Crear objetivo</Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {controller.objectives.map((objective) => (
            <li
              key={objective.id_objective}
              className="flex flex-col gap-3 rounded-xl glass-subtle p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <StatusBadge
                  label={DEVELOPMENT_OBJECTIVE_STATUS.labels[objective.status]}
                  tone={DEVELOPMENT_OBJECTIVE_STATUS.tones[objective.status]}
                />
                {controller.canManage && (
                  <RowActionsMenu
                    subject="este objetivo"
                    actions={[
                      {
                        label: 'Editar',
                        icon: Pencil,
                        onSelect: () => dialogs.openEdit(objective),
                      },
                      {
                        label: 'Eliminar',
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => dialogs.openDelete(objective),
                      },
                    ]}
                  />
                )}
              </div>
              <p className="text-pretty">{objective.description}</p>
              <p className="text-xs text-muted-foreground">
                Meta: {formatDate(objective.target_date)}
                {objective.set_by_name ? ` · Definido por ${objective.set_by_name}` : ''}
                {objective.season_name ? ` · ${objective.season_name}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ObjectiveFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        idUser={idUser}
        objective={dialogs.editing}
        onClose={dialogs.close}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title="¿Eliminar este objetivo?"
        description={dialogs.deleting?.description}
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </TabSection>
  )
}
