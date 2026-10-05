import { Pencil, Plus, ShieldCheck, Stethoscope, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { HealthRecordFormSheet } from '@/components/modules/health/HealthRecordFormSheet'
import { Button } from '@/components/ui/button'
import { HEALTH_RECORD_STATUS } from '@/constants/enums'
import { useHealthRecordsTabController } from '@/controllers/health/useHealthRecordsTabController'
import type { HealthRecord } from '@/types/athlete'

function recordSubject(record: HealthRecord) {
  return `el registro de ${record.condition_type} de ${record.athlete_name || 'este deportista'}`
}

export function HealthRecordsTab() {
  const controller = useHealthRecordsTabController()
  const { dialogs } = controller

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={
          <span className="flex items-start gap-2">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            Información sensible: cada consulta, creación o cambio queda registrado en la auditoría.
          </span>
        }
      >
        <Button onClick={dialogs.openCreate}>
          <Plus aria-hidden="true" />
          Nuevo registro
        </Button>
      </TabToolbar>

      <div className="sm:max-w-60">
        <SelectInput
          aria-label="Filtrar por estado"
          value={controller.status}
          onValueChange={controller.setStatus}
          options={controller.statusOptions}
        />
      </div>

      <DataTable
        caption="Registros de salud"
        rows={controller.records}
        getRowKey={(record) => record.id_health}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={Stethoscope}
            title={
              controller.hasFilters ? 'Ningún registro con ese estado' : 'Sin registros de salud'
            }
          />
        }
        columns={[
          {
            key: 'athlete',
            header: 'Deportista',
            cell: (record) => <span className="font-medium">{record.athlete_name || '—'}</span>,
          },
          {
            key: 'condition',
            header: 'Condición',
            cell: (record) => (
              <span className="flex max-w-md flex-col gap-0.5">
                <span>{record.condition_type}</span>
                {record.description && (
                  <span className="line-clamp-2 text-xs text-muted-foreground">
                    {record.description}
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'restriction',
            header: 'Restricción',
            cell: (record) =>
              record.restriction ? (
                <StatusBadge label="Limita la actividad" tone="warning" />
              ) : (
                'No'
              ),
          },
          {
            key: 'status',
            header: 'Estado',
            cell: (record) => (
              <StatusBadge
                label={HEALTH_RECORD_STATUS.labels[record.status]}
                tone={HEALTH_RECORD_STATUS.tones[record.status]}
              />
            ),
          },
          {
            key: 'registered-by',
            header: 'Registró',
            cell: (record) => record.registered_by_name || '—',
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (record) => (
              <RowActionsMenu
                subject={recordSubject(record)}
                actions={[
                  { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(record) },
                  {
                    label: 'Eliminar',
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => dialogs.openDelete(record),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <HealthRecordFormSheet
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        record={dialogs.editing}
        onClose={dialogs.close}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar ${dialogs.deleting ? recordSubject(dialogs.deleting) : 'el registro'}?`}
        description="Esta acción no se puede deshacer. La eliminación queda en la auditoría."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
