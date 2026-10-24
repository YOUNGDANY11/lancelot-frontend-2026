import { ChartLine, Layers } from 'lucide-react'
import { SeasonComparisonChart } from '@/components/charts/SeasonComparisonChart'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { SEASON_STATUS } from '@/constants/enums'
import { useCategoryEvolutionController } from '@/controllers/talent/useCategoryEvolutionController'
import { formatNumber } from '@/utils/formatNumber'

export function CategoryEvolutionTab() {
  const controller = useCategoryEvolutionController()

  if (!controller.hasCategories) {
    return (
      <EmptyState
        icon={Layers}
        title="Aún no hay categorías"
        description="La evolución se consulta por categoría."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Cómo cambia cada categoría de una temporada a otra: promedio del índice y de sus dimensiones entre los deportistas que tienen en ella su categoría base, y cuántos fueron señalados como talento." />

      {controller.canChooseCategory && (
        <div className="sm:max-w-60">
          <SelectInput
            aria-label="Categoría"
            value={controller.categoryValue}
            onValueChange={controller.onCategoryChange}
            options={controller.categoryOptions}
          />
        </div>
      )}

      {!controller.isLoading && !controller.errorMessage && (
        <SeasonComparisonChart
          comparison={controller.chartPoints}
          title={`Evolución de ${controller.categoryName}`}
          description="Promedio del índice de progreso y de sus dimensiones, de 0 a 100."
          emptyMessage="Esta categoría aún no tiene índices calculados en ninguna temporada."
          singleMessage="Solo hay una temporada con índices en esta categoría. La evolución aparece desde la segunda."
        />
      )}

      <DataTable
        caption={`Temporadas de ${controller.categoryName}`}
        rows={controller.evolution}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        getRowKey={(point) => point.id_season}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={ChartLine}
            title="Sin temporadas registradas"
            description="Aparecen cuando la categoría tiene deportistas asignados en una temporada."
          />
        }
        columns={[
          {
            key: 'season',
            header: 'Temporada',
            cell: (point) => (
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{point.season_name}</span>
                <StatusBadge
                  label={SEASON_STATUS.labels[point.status]}
                  tone={SEASON_STATUS.tones[point.status]}
                />
              </span>
            ),
          },
          {
            key: 'athletes',
            header: 'Deportistas',
            cell: (point) => (
              <span className="flex flex-col">
                <span className="tabular-nums">{point.athletes}</span>
                {point.guests > 0 && (
                  <span className="text-xs text-muted-foreground">
                    y {point.guests} de categorías menores
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'indexed',
            header: 'Con índice',
            className: 'tabular-nums',
            cell: (point) => `${point.indexed} de ${point.athletes}`,
          },
          {
            key: 'index',
            header: 'Índice promedio',
            className: 'font-semibold tabular-nums',
            cell: (point) => formatNumber(point.index_value, 1),
          },
          {
            key: 'talent',
            header: 'Talento',
            className: 'tabular-nums',
            cell: (point) =>
              point.talent_flags === 0
                ? 'Sin señalizaciones'
                : `${point.reviewed_talent_flags} revisadas de ${point.talent_flags}`,
          },
        ]}
      />
    </div>
  )
}
