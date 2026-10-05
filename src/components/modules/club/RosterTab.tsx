import { ArrowRightLeft, IdCard, TriangleAlert, UserMinus, UserPlus, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu, type RowAction } from '@/components/common/RowActionsMenu'
import { AssignmentChangeDialog } from '@/components/modules/club/AssignmentChangeDialog'
import { AthleteAssignmentFormDialog } from '@/components/modules/club/AthleteAssignmentFormDialog'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { APP_MODULES } from '@/constants/navigation'
import { useRosterTabController } from '@/controllers/club/useRosterTabController'
import type { AthleteAssignment } from '@/types/club'
import { fullName } from '@/utils/text'

export function RosterTab() {
  const controller = useRosterTabController()
  const { dialogs } = controller
  const navigate = useNavigate()

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={Users}
        title="Selecciona una temporada"
        description="La plantilla se arma por temporada."
      />
    )
  }

  const profilePath = (assignment: AthleteAssignment) =>
    `${APP_MODULES.athletes.path}/${assignment.id_user}`

  const actionsFor = (assignment: AthleteAssignment): RowAction[] => [
    { label: 'Ver ficha', icon: IdCard, onSelect: () => navigate(profilePath(assignment)) },
    ...(controller.canManage
      ? [
          {
            label: 'Cambiar de categoría',
            icon: ArrowRightLeft,
            onSelect: () => dialogs.openEdit(assignment),
          },
          {
            label: 'Quitar de la plantilla',
            icon: UserMinus,
            destructive: true,
            onSelect: () => dialogs.openDelete(assignment),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={`Plantilla de ${controller.season?.name ?? 'la temporada'}${
          controller.categoryFilterName ? ` · ${controller.categoryFilterName}` : ''
        }. Un deportista puede estar en su categoría y en las superiores, nunca en una menor.`}
      >
        {controller.canManage && (
          <Button onClick={dialogs.openCreate}>
            <UserPlus aria-hidden="true" />
            Asignar deportista
          </Button>
        )}
      </TabToolbar>

      {controller.missingPositions > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          {controller.missingPositions === 1
            ? 'Hay 1 deportista sin posición. Sin posición no se puede calcular su índice de progreso.'
            : `Hay ${controller.missingPositions} deportistas sin posición. Sin posición no se puede calcular su índice de progreso.`}
        </p>
      )}

      <DataTable
        caption="Plantilla"
        rows={controller.roster}
        getRowKey={(assignment) => assignment.id_ath_cat}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Users}
            title="Aún no hay deportistas en la plantilla"
            description="Asigna cada deportista a su categoría con su posición. También puede jugar en categorías superiores."
            action={
              controller.canManage && (
                <Button onClick={dialogs.openCreate}>Asignar deportista</Button>
              )
            }
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Deportista',
            cell: (assignment) => (
              <Link
                to={profilePath(assignment)}
                className="font-medium underline-offset-4 hover:text-primary hover:underline"
              >
                {fullName(assignment)}
              </Link>
            ),
          },
          {
            key: 'category',
            header: 'Categoría',
            cell: (assignment) => assignment.category_name ?? '—',
          },
          {
            key: 'position',
            header: 'Posición',
            cell: (assignment) =>
              assignment.position ?? <span className="text-risk-medium">Sin posición</span>,
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (assignment) => (
              <RowActionsMenu subject={fullName(assignment)} actions={actionsFor(assignment)} />
            ),
          },
        ]}
      />

      <AthleteAssignmentFormDialog
        open={dialogs.isCreateOpen}
        onOpenChange={(open) => !open && dialogs.close()}
        season={controller.season}
      />
      <AssignmentChangeDialog assignment={dialogs.editing} onClose={dialogs.close} />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Quitar a ${dialogs.deleting ? fullName(dialogs.deleting) : ''} de la plantilla?`}
        description="Se elimina su asignación en esta temporada. Sus evaluaciones y su carga se conservan."
        confirmLabel="Quitar"
        onConfirm={controller.confirmRemove}
        pending={controller.isRemoving}
        destructive
      />
    </div>
  )
}
