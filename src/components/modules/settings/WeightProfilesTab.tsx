import { Pencil, Plus, Scale, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { HelpHint } from '@/components/common/HelpHint'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { SelectInput } from '@/components/common/SelectInput'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { WeightProfileFormDialog } from '@/components/modules/settings/WeightProfileFormDialog'
import { Button } from '@/components/ui/button'
import { useWeightProfilesTabController } from '@/controllers/settings/useWeightProfilesTabController'
import { formatPercent } from '@/utils/formatNumber'

export function WeightProfilesTab() {
  const controller = useWeightProfilesTabController()
  const { dialogs } = controller

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={
          <span className="flex items-center gap-1">
            Cuánto pesa cada dimensión en el índice de progreso según la posición y la categoría.
            Los tres pesos suman 100 %.
            <HelpHint term="weightProfile" />
          </span>
        }
      >
        <Button onClick={dialogs.openCreate}>
          <Plus aria-hidden="true" />
          Crear perfil
        </Button>
      </TabToolbar>

      <div className="sm:max-w-60">
        <SelectInput
          aria-label="Filtrar por categoría"
          value={controller.categoryFilter}
          onValueChange={controller.setCategoryFilter}
          options={controller.categoryOptions}
        />
      </div>

      <DataTable
        caption="Perfiles de pesos"
        rows={controller.profiles}
        getRowKey={(profile) => profile.id_profile}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Scale}
            title="Aún no hay perfiles de pesos"
            description="Sin un perfil para su posición y categoría no se puede calcular el índice de un deportista."
          />
        }
        columns={[
          { key: 'category', header: 'Categoría', cell: (profile) => profile.age_category },
          { key: 'position', header: 'Posición', cell: (profile) => profile.position },
          {
            key: 'physical',
            header: 'Física',
            className: 'tabular-nums',
            cell: (profile) => formatPercent(profile.w_physical * 100),
          },
          {
            key: 'technical',
            header: 'Técnica',
            className: 'tabular-nums',
            cell: (profile) => formatPercent(profile.w_technical * 100),
          },
          {
            key: 'participation',
            header: 'Participación',
            className: 'tabular-nums',
            cell: (profile) => formatPercent(profile.w_participation * 100),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (profile) => (
              <RowActionsMenu
                subject={`el perfil de ${profile.position} en ${profile.age_category}`}
                actions={[
                  { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(profile) },
                  {
                    label: 'Eliminar',
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => dialogs.openDelete(profile),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <WeightProfileFormDialog
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        profile={dialogs.editing}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar el perfil de ${dialogs.deleting?.position ?? ''} en ${dialogs.deleting?.age_category ?? ''}?`}
        description="Los deportistas de esa posición y categoría no podrán recalcular su índice hasta que exista un perfil."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
