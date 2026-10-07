import { Pencil, Search, Trash2, UserPlus, Users } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { UserAccountFormSheet } from '@/components/modules/settings/UserAccountFormSheet'
import { UserEditFormSheet } from '@/components/modules/settings/UserEditFormSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUsersTabController } from '@/controllers/settings/useUsersTabController'
import { resolveRoleCode } from '@/utils/role'
import { fullName } from '@/utils/text'

export function UsersTab() {
  const controller = useUsersTabController()
  const { dialogs } = controller

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Cuentas del cuerpo técnico y de los deportistas. Solo el administrador las gestiona.">
        <Button onClick={controller.createSheet.open}>
          <UserPlus aria-hidden="true" />
          Crear cuenta
        </Button>
      </TabToolbar>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Buscar por nombre o correo"
            placeholder="Buscar por nombre o correo"
            value={controller.search}
            onChange={(event) => controller.setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <SelectInput
          aria-label="Filtrar por rol"
          value={controller.role}
          onValueChange={controller.setRole}
          options={controller.roleOptions}
        />
      </div>

      <DataTable
        caption="Usuarios"
        rows={controller.rows}
        getRowKey={(account) => account.id_user}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={<EmptyState icon={Users} title="Ningún usuario con esos filtros" />}
        columns={[
          {
            key: 'name',
            header: 'Nombre',
            cell: (account) => (
              <span className="flex flex-col">
                <span className="flex items-center gap-2 font-medium">
                  {fullName(account)}
                  {controller.isSelf(account) && <StatusBadge label="Tú" tone="info" />}
                </span>
                <span className="text-xs text-muted-foreground">{account.email}</span>
              </span>
            ),
          },
          {
            key: 'role',
            header: 'Rol',
            cell: (account) =>
              controller.roleLabel(resolveRoleCode(account.role_name, account.id_role)),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (account) => (
              <RowActionsMenu
                subject={fullName(account)}
                actions={[
                  { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(account) },
                  ...(controller.isSelf(account)
                    ? []
                    : [
                        {
                          label: 'Eliminar',
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => dialogs.openDelete(account),
                        },
                      ]),
                ]}
              />
            ),
          },
        ]}
      />

      <UserAccountFormSheet
        open={controller.createSheet.isOpen}
        onOpenChange={controller.createSheet.setIsOpen}
      />
      <UserEditFormSheet account={dialogs.editing} onClose={dialogs.close} />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar la cuenta de ${dialogs.deleting ? fullName(dialogs.deleting) : ''}?`}
        description="La persona ya no podrá ingresar. Si tiene registros asociados, el sistema puede impedir la eliminación."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
