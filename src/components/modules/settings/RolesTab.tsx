import { ShieldCheck } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useRolesTabController } from '@/controllers/settings/useRolesTabController'

export function RolesTab() {
  const controller = useRolesTabController()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-pretty text-muted-foreground">
        Los roles los define el sistema y no se editan desde aquí. Para cambiar lo que puede hacer
        una persona, cambia su rol en la pestaña Usuarios.
      </p>
      <DataTable
        caption="Roles"
        rows={controller.roles}
        getRowKey={(role) => role.id_role}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={<EmptyState icon={ShieldCheck} title="No hay roles registrados" />}
        columns={[
          {
            key: 'role',
            header: 'Rol',
            cell: (role) => (
              <span className="flex items-center gap-2 font-medium">
                {role.label}
                {!role.recognized && <StatusBadge label="No reconocido" tone="warning" />}
              </span>
            ),
          },
          {
            key: 'summary',
            header: 'Qué hace',
            cell: (role) => (
              <span className="text-sm text-pretty text-muted-foreground">{role.summary}</span>
            ),
          },
        ]}
      />
    </div>
  )
}
