import { ScrollText } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { FormField } from '@/components/common/FormField'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { Input } from '@/components/ui/input'
import { HEALTH_ACCESS_ACTION } from '@/constants/enums'
import { useHealthAuditController } from '@/controllers/health/useHealthAuditController'
import { formatDateTime } from '@/utils/formatDate'

export function HealthAuditTab() {
  const controller = useHealthAuditController()

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Quién consultó, creó, editó o eliminó registros de salud y cuándo. Solo la ve el administrador." />

      <div className="sm:max-w-60">
        <FormField
          id="audit-record"
          label="Número de registro"
          optional
          error={controller.recordIdInvalid ? 'Escribe solo números.' : undefined}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="numeric"
              value={controller.recordId}
              onChange={(event) => controller.setRecordId(event.target.value)}
              placeholder="Todos"
            />
          )}
        </FormField>
      </div>

      <DataTable
        caption="Auditoría de registros de salud"
        rows={controller.logs}
        getRowKey={(log) => log.id_log}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={ScrollText}
            title={
              controller.hasFilters
                ? 'No hay accesos a ese registro'
                : 'Aún no hay accesos registrados'
            }
          />
        }
        columns={[
          {
            key: 'date',
            header: 'Fecha y hora',
            className: 'tabular-nums whitespace-nowrap',
            cell: (log) => formatDateTime(log.accessed_at),
          },
          {
            key: 'user',
            header: 'Usuario',
            cell: (log) => log.accessed_by_name || `Usuario ${log.accessed_by}`,
          },
          {
            key: 'action',
            header: 'Acción',
            cell: (log) => (
              <StatusBadge
                label={HEALTH_ACCESS_ACTION.labels[log.action]}
                tone={HEALTH_ACCESS_ACTION.tones[log.action]}
              />
            ),
          },
          {
            key: 'record',
            header: 'Registro',
            className: 'tabular-nums',
            cell: (log) => (log.id_health ? `#${log.id_health}` : '—'),
          },
        ]}
      />
    </div>
  )
}
