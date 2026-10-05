import { Calculator, RefreshCw, TrendingUp, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { CategoryRankingBar } from '@/components/charts/CategoryRankingBar'
import { ProgressRadarChart } from '@/components/charts/ProgressRadarChart'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { HelpHint } from '@/components/common/HelpHint'
import { SelectInput } from '@/components/common/SelectInput'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { RunSummaryDialog } from '@/components/modules/talent/RunSummaryDialog'
import { Button } from '@/components/ui/button'
import { APP_MODULES } from '@/constants/navigation'
import { useIndicesTabController } from '@/controllers/talent/useIndicesTabController'
import { formatNumber } from '@/utils/formatNumber'
import { fullName } from '@/utils/text'

export function IndicesTab() {
  const controller = useIndicesTabController()

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Selecciona una temporada"
        description="El índice de progreso se calcula por temporada."
      />
    )
  }

  const selected = controller.selected

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={
          <span className="flex items-center gap-1">
            Índice de progreso ponderado de {controller.season?.name}
            {controller.categoryName ? ` · ${controller.categoryName}` : ''}. Cada deportista se
            compara con su categoría de edad.
            <HelpHint term="progressIndex" />
          </span>
        }
      >
        {controller.canRecalculateSeason && (
          <Button variant="outline" onClick={controller.askRecalculateSeason}>
            <Calculator aria-hidden="true" />
            Recalcular temporada
          </Button>
        )}
      </TabToolbar>

      {controller.canChooseCategory && (
        <div className="sm:max-w-60">
          <SelectInput
            aria-label="Categoría del ranking"
            value={controller.categoryValue}
            onValueChange={controller.onCategoryChange}
            options={controller.categoryOptions}
          />
        </div>
      )}

      {controller.missing.length > 0 && !controller.isLoading && (
        <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          {controller.missing.length === 1
            ? `${fullName(controller.missing[0])} aún no tiene índice en esta temporada.`
            : `${controller.missing.length} deportistas aún no tienen índice en esta temporada.`}{' '}
          Necesitan posición, un perfil de pesos para su posición y categoría, y evaluaciones.
        </p>
      )}

      {!controller.isLoading && !controller.errorMessage && controller.ranking.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <CategoryRankingBar
            title={
              controller.categoryName ? `Ranking de ${controller.categoryName}` : 'Ranking general'
            }
            entries={controller.ranking}
            selectedUser={selected?.index.id_user ?? null}
            onSelect={(idUser) => {
              const entry = controller.ranking.find((item) => item.index.id_user === idUser)
              if (entry) controller.selectEntry(entry)
            }}
          />
          <div className="flex flex-col gap-2">
            {selected && (
              <p className="text-sm font-medium">
                {selected.rank}. {selected.athleteName}
                {selected.category_name ? ` · ${selected.category_name}` : ''}
              </p>
            )}
            <ProgressRadarChart index={selected?.index ?? null} />
            {selected?.index.warnings && selected.index.warnings.length > 0 && (
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                {selected.index.warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-1.5">
                    <TriangleAlert
                      aria-hidden="true"
                      className="mt-0.5 size-3.5 shrink-0 text-risk-medium"
                    />
                    {warning}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <DataTable
        caption="Índices de progreso"
        rows={controller.ranking}
        getRowKey={(entry) => entry.index.id_index}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        onRowClick={controller.selectEntry}
        emptyState={
          <EmptyState
            icon={TrendingUp}
            title="Aún no hay índices en esta temporada"
            description={
              controller.canRecalculateSeason
                ? 'Usa “Recalcular temporada” cuando haya evaluaciones registradas.'
                : 'El director técnico o el administrador pueden recalcular la temporada.'
            }
          />
        }
        columns={[
          { key: 'rank', header: '#', className: 'w-10 tabular-nums', cell: (entry) => entry.rank },
          {
            key: 'athlete',
            header: 'Deportista',
            cell: (entry) => (
              <span className="flex flex-col">
                <Link
                  to={`${APP_MODULES.athletes.path}/${entry.index.id_user}`}
                  className="font-medium hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  {entry.athleteName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {[entry.category_name, entry.position].filter(Boolean).join(' · ')}
                </span>
              </span>
            ),
          },
          {
            key: 'index',
            header: 'Índice',
            className: 'font-semibold tabular-nums',
            cell: (entry) => formatNumber(entry.index.index_value, 1),
          },
          {
            key: 'physical',
            header: 'Física',
            className: 'tabular-nums',
            cell: (entry) => formatNumber(entry.index.physical_score, 0),
          },
          {
            key: 'technical',
            header: 'Técnica',
            className: 'tabular-nums',
            cell: (entry) => formatNumber(entry.index.technical_score, 0),
          },
          {
            key: 'participation',
            header: 'Participación',
            className: 'tabular-nums',
            cell: (entry) => formatNumber(entry.index.participation_score, 0),
          },
          {
            key: 'actions',
            header: <span className="sr-only">Acciones</span>,
            className: 'text-right',
            cell: (entry) => (
              <Button
                size="sm"
                variant="ghost"
                disabled={controller.recalculatingUser === entry.index.id_user}
                onClick={(event) => {
                  event.stopPropagation()
                  controller.recalculateAthlete(entry.index.id_user)
                }}
                aria-label={`Recalcular el índice de ${entry.athleteName}`}
              >
                <RefreshCw aria-hidden="true" />
                Recalcular
              </Button>
            ),
          },
        ]}
      />

      <ConfirmDialog
        open={controller.confirmingSeason}
        onOpenChange={(open) => !open && controller.cancelRecalculateSeason()}
        title={`¿Recalcular los índices de ${controller.season?.name ?? 'la temporada'}?`}
        description="Se recalcula el índice de todos los deportistas asignados con sus evaluaciones y su participación actuales. Puede tardar unos segundos."
        confirmLabel="Recalcular"
        onConfirm={controller.recalculateSeason}
        pending={controller.isRecalculatingSeason}
      />
      <RunSummaryDialog
        open={controller.summary !== null}
        title="Recálculo de la temporada"
        message={controller.summary?.mensaje ?? ''}
        stats={[
          { label: 'Recalculados', value: controller.summary?.recalculated ?? 0 },
          { label: 'Con error', value: controller.summary?.failed.length ?? 0 },
        ]}
        failures={(controller.summary?.failed ?? []).map((failure) => ({
          ...failure,
          name: controller.nameOf(failure.id_user),
        }))}
        onClose={controller.closeSummary}
      />
    </div>
  )
}
