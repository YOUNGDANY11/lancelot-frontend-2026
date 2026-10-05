import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { CategoryFormDialog } from '@/components/modules/club/CategoryFormDialog'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Button } from '@/components/ui/button'
import { useCategoriesTabController } from '@/controllers/club/useCategoriesTabController'

export function CategoriesTab() {
  const controller = useCategoriesTabController()
  const { dialogs } = controller
  const formCategory = dialogs.editing

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Cada categoría agrupa un rango de edades.">
        {controller.canManage && (
          <Button onClick={dialogs.openCreate}>
            <Plus aria-hidden="true" />
            Crear categoría
          </Button>
        )}
      </TabToolbar>

      <DataTable
        caption="Categorías"
        rows={controller.categories}
        getRowKey={(category) => category.id_category}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Users}
            title="Aún no hay categorías"
            description="Crea las categorías del club, por ejemplo Sub-13 o Sub-15."
            action={
              controller.canManage && <Button onClick={dialogs.openCreate}>Crear categoría</Button>
            }
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Categoría',
            cell: (category) => <span className="font-medium">{category.name}</span>,
          },
          {
            key: 'ages',
            header: 'Edades',
            cell: (category) => `${category.min_age} a ${category.max_age} años`,
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (category) => (
              <RowActionsMenu
                subject={category.name}
                actions={
                  controller.canManage
                    ? [
                        {
                          label: 'Editar',
                          icon: Pencil,
                          onSelect: () => dialogs.openEdit(category),
                        },
                        {
                          label: 'Eliminar',
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => dialogs.openDelete(category),
                        },
                      ]
                    : []
                }
              />
            ),
          },
        ]}
      />

      <CategoryFormDialog
        open={dialogs.isCreateOpen || formCategory !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        category={formCategory}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la categoría ${dialogs.deleting?.name ?? ''}?`}
        description="Esta acción no se puede deshacer. Si la categoría tiene deportistas, sesiones o partidos asociados, el sistema no permitirá eliminarla."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
