import { DatabaseZap, Download, RefreshCw, Tags } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { DateRangeFields } from '@/components/common/DateRangeFields'
import { EmptyState } from '@/components/common/EmptyState'
import { LevelBadge } from '@/components/common/LevelBadge'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { RunSummaryDialog } from '@/components/modules/talent/RunSummaryDialog'
import { Button } from '@/components/ui/button'
import { useDataTabController } from '@/controllers/analytics/useDataTabController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

const OPERATION_TEXTS = {
  backfill: {
    title: '¿Reconstruir los snapshots del periodo?',
    description:
      'Se recalculan las variables diarias de todos los deportistas con los datos ya cargados y se etiquetan los días con 7 días cumplidos. Úsalo cuando se digitaron datos tarde.',
    confirm: 'Reconstruir',
  },
  relabel: {
    title: '¿Re-etiquetar el periodo?',
    description:
      'Se recalcula si hubo una lesión sin contacto en los 7 días siguientes de cada día. Úsalo después de registrar o corregir lesiones.',
    confirm: 'Re-etiquetar',
  },
} as const

export function DataTab() {
  const controller = useDataTabController()
  const { range, summary } = controller
  const operation = controller.confirming ? OPERATION_TEXTS[controller.confirming] : null

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-pretty text-muted-foreground">
        Variables diarias que alimentan el modelo. El CSV sale seudonimizado: sin nombres, correos
        ni fechas de nacimiento.
      </p>
      <div className="flex flex-col gap-4 rounded-2xl glass-subtle p-4 lg:flex-row lg:items-end lg:justify-between">
        <DateRangeFields
          idPrefix="datos"
          from={range.from}
          to={range.to}
          onFromChange={range.setFrom}
          onToChange={range.setTo}
          error={range.error}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={controller.exportCsv}
            disabled={!range.isValid || controller.isExporting}
          >
            <Download aria-hidden="true" />
            {controller.isExporting ? 'Exportando…' : 'Exportar CSV'}
          </Button>
          {controller.canRunOperations && (
            <>
              <Button
                variant="outline"
                onClick={() => controller.askOperation('backfill')}
                disabled={!range.isValid}
              >
                <RefreshCw aria-hidden="true" />
                Reconstruir snapshots
              </Button>
              <Button
                variant="outline"
                onClick={() => controller.askOperation('relabel')}
                disabled={!range.isValid}
              >
                <Tags aria-hidden="true" />
                Re-etiquetar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="sm:max-w-64">
        <SelectInput
          aria-label="Filtrar por etiqueta"
          value={controller.quality}
          onValueChange={controller.setQuality}
          options={controller.qualityOptions}
        />
      </div>

      <DataTable
        caption="Snapshots diarios de variables"
        rows={controller.rows}
        getRowKey={(row) => row.id_feature}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={DatabaseZap}
            title="No hay snapshots en este periodo"
            description="Los snapshots se generan cada noche; también puedes reconstruirlos."
          />
        }
        columns={[
          {
            key: 'date',
            header: 'Fecha',
            className: 'tabular-nums whitespace-nowrap',
            cell: (row) => formatDate(row.date),
          },
          { key: 'athlete', header: 'Deportista', cell: (row) => controller.nameOf(row.id_user) },
          {
            key: 'acwr',
            header: 'ACWR',
            className: 'tabular-nums',
            cell: (row) => formatNumber(row.acwr, 2),
          },
          {
            key: 'acute',
            header: 'Carga aguda',
            className: 'tabular-nums',
            cell: (row) => formatNumber(row.acute_load_7d, 0),
          },
          {
            key: 'sessions',
            header: 'Sesiones (7 días)',
            className: 'tabular-nums',
            cell: (row) => row.sessions_7d,
          },
          {
            key: 'rules',
            header: 'Riesgo por reglas',
            cell: (row) =>
              row.rules_risk_level ? <LevelBadge level={row.rules_risk_level} /> : '—',
          },
          {
            key: 'label',
            header: 'Etiqueta',
            cell: (row) => (
              <span className="flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  label={controller.qualityLabel(row.label_quality)}
                  tone={row.label_quality === 'labeled' ? 'success' : 'neutral'}
                />
                {row.label_injury_7d && <StatusBadge label="Lesión en 7 días" tone="danger" />}
              </span>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={operation !== null}
        onOpenChange={(open) => !open && controller.cancelOperation()}
        title={operation?.title ?? ''}
        description={operation?.description ?? ''}
        confirmLabel={operation?.confirm ?? 'Confirmar'}
        onConfirm={controller.runOperation}
        pending={controller.isRunning}
      />
      <RunSummaryDialog
        open={summary !== null}
        title={summary?.title ?? ''}
        message={summary?.message ?? ''}
        stats={summary?.stats ?? []}
        failures={(summary?.failures ?? []).map((failure) => ({
          ...failure,
          name: controller.nameOf(failure.id_user),
        }))}
        onClose={controller.closeSummary}
      />
    </div>
  )
}
