import { HeartPulse, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { RowActionsMenu } from '@/components/common/RowActionsMenu'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { InjuryFormSheet } from '@/components/modules/health/InjuryFormSheet'
import { MissingMechanismSheet } from '@/components/modules/health/MissingMechanismSheet'
import { Button } from '@/components/ui/button'
import { INJURY_MECHANISM, INJURY_SEVERITY, INJURY_STATUS } from '@/constants/enums'
import { useInjuriesTabController } from '@/controllers/health/useInjuriesTabController'
import type { Injury } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'

function injurySubject(injury: Injury) {
  return `la lesión de ${injury.athlete_name || 'este deportista'} del ${formatDate(injury.injury_date)}`
}

export function InjuriesTab() {
  const controller = useInjuriesTabController()
  const { dialogs } = controller

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Registra cada lesión con su mecanismo. El estado solo cambia cuando tú lo actualizas.">
        <Button onClick={dialogs.openCreate}>
          <Plus aria-hidden="true" />
          Registrar lesión
        </Button>
      </TabToolbar>

      {controller.missingMechanism > 0 && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-risk-medium/40 bg-risk-medium/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
            <span>
              {controller.missingMechanism === 1
                ? '1 lesión no tiene mecanismo registrado.'
                : `${controller.missingMechanism} lesiones no tienen mecanismo registrado.`}{' '}
              Sin ese dato no sirven para el modelo de riesgo.
            </span>
          </p>
          <Button variant="outline" size="sm" onClick={controller.missingSheet.open}>
            Completar mecanismo
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
        <SelectInput
          aria-label="Filtrar por estado"
          value={controller.status}
          onValueChange={controller.setStatus}
          options={controller.statusOptions}
        />
        <SelectInput
          aria-label="Filtrar por mecanismo"
          value={controller.mechanism}
          onValueChange={controller.setMechanism}
          options={controller.mechanismOptions}
        />
      </div>

      <DataTable
        caption="Lesiones"
        rows={controller.injuries}
        getRowKey={(injury) => injury.id_injury}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={HeartPulse}
            title={
              controller.hasFilters ? 'Ninguna lesión con esos filtros' : 'Sin lesiones registradas'
            }
          />
        }
        columns={[
          {
            key: 'athlete',
            header: 'Deportista',
            cell: (injury) => (
              <span className="flex flex-col">
                <span className="font-medium">{injury.athlete_name || '—'}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(injury.injury_date)}
                </span>
              </span>
            ),
          },
          {
            key: 'injury',
            header: 'Lesión',
            cell: (injury) => (
              <span className="flex flex-col gap-1">
                <span>{injury.body_part}</span>
                <StatusBadge
                  label={INJURY_SEVERITY.labels[injury.severity]}
                  tone={INJURY_SEVERITY.tones[injury.severity]}
                />
              </span>
            ),
          },
          {
            key: 'mechanism',
            header: 'Mecanismo',
            cell: (injury) =>
              injury.mechanism ? (
                INJURY_MECHANISM.labels[injury.mechanism]
              ) : (
                <StatusBadge label="Sin registrar" tone="warning" />
              ),
          },
          {
            key: 'status',
            header: 'Estado',
            cell: (injury) => (
              <StatusBadge
                label={INJURY_STATUS.labels[injury.status]}
                tone={INJURY_STATUS.tones[injury.status]}
              />
            ),
          },
          {
            key: 'time-loss',
            header: 'Días de baja',
            className: 'tabular-nums',
            cell: (injury) => injury.time_loss_days ?? '—',
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'w-12 text-right',
            cell: (injury) => (
              <RowActionsMenu
                subject={injurySubject(injury)}
                actions={[
                  { label: 'Editar', icon: Pencil, onSelect: () => dialogs.openEdit(injury) },
                  {
                    label: 'Eliminar',
                    icon: Trash2,
                    destructive: true,
                    onSelect: () => dialogs.openDelete(injury),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <InjuryFormSheet
        open={dialogs.isCreateOpen || dialogs.editing !== null}
        injury={dialogs.editing}
        onClose={dialogs.close}
      />
      <MissingMechanismSheet
        open={controller.missingSheet.isOpen}
        onOpenChange={controller.missingSheet.setIsOpen}
      />
      <ConfirmDialog
        open={dialogs.deleting !== null}
        onOpenChange={(open) => !open && dialogs.close()}
        title={`¿Eliminar ${dialogs.deleting ? injurySubject(dialogs.deleting) : 'la lesión'}?`}
        description="Se borra del historial y deja de contar para el modelo de riesgo. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={controller.confirmDelete}
        pending={controller.isDeleting}
        destructive
      />
    </div>
  )
}
