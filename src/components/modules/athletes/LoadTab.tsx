import { Activity } from 'lucide-react'
import { AcwrTrendChart } from '@/components/charts/AcwrTrendChart'
import { DailyLoadBars } from '@/components/charts/DailyLoadBars'
import { LoadCalendarHeatmap } from '@/components/charts/LoadCalendarHeatmap'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { TabSection } from '@/components/modules/athletes/TabSection'
import { Button } from '@/components/ui/button'
import { LOAD_RANGES, useLoadTabController } from '@/controllers/athletes/useLoadTabController'
import { formatDate } from '@/utils/formatDate'
import { formatLoad } from '@/utils/formatNumber'

export function LoadTab({ idUser }: { idUser: number }) {
  const controller = useLoadTabController(idUser)

  return (
    <TabSection
      description={
        <span className="flex items-center gap-1">
          Carga interna con RPE × minutos y su relación aguda:crónica.
          <HelpHint term="trainingLoad" />
        </span>
      }
      action={
        <div
          className="flex rounded-lg border border-border p-0.5"
          role="group"
          aria-label="Periodo"
        >
          {LOAD_RANGES.map((range) => (
            <Button
              key={range.days}
              size="sm"
              variant={controller.rangeDays === range.days ? 'default' : 'ghost'}
              aria-pressed={controller.rangeDays === range.days}
              onClick={() => controller.setRangeDays(range.days)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      }
    >
      {controller.isLoadingSeries ? (
        <LoadingSkeleton variant="cards" rows={2} label="Cargando la serie de carga" />
      ) : controller.seriesError || !controller.thresholds ? (
        <ErrorState
          message={controller.seriesError ?? 'No pudimos cargar la carga.'}
          onRetry={controller.retrySeries}
        />
      ) : (
        <>
          <AcwrTrendChart series={controller.rangeSeries} thresholds={controller.thresholds} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
            <DailyLoadBars series={controller.rangeSeries} />
            <LoadCalendarHeatmap series={controller.heatmapSeries} />
          </div>
        </>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">Cargas registradas</h3>
        <DataTable
          caption="Cargas registradas"
          rows={controller.loads}
          getRowKey={(load) => load.id_load}
          pagination={controller.loadsPagination}
          onPageChange={controller.setLoadsPage}
          isLoading={controller.isLoadingLoads}
          errorMessage={controller.loadsError}
          onRetry={controller.retryLoads}
          emptyState={
            <EmptyState
              icon={Activity}
              title="Aún no hay cargas registradas"
              description="Las cargas se registran desde Entrenamiento después de cada sesión."
            />
          }
          columns={[
            {
              key: 'date',
              header: 'Sesión',
              cell: (load) => (load.session_date ? formatDate(load.session_date) : '—'),
            },
            {
              key: 'rpe',
              header: 'RPE',
              cell: (load) => <span className="tabular-nums">{load.rpe}</span>,
            },
            {
              key: 'minutes',
              header: 'Minutos',
              cell: (load) => <span className="tabular-nums">{load.duration_min}</span>,
            },
            {
              key: 'load',
              header: 'Carga',
              cell: (load) => (
                <span className="font-medium tabular-nums">{formatLoad(load.session_load)}</span>
              ),
            },
          ]}
        />
      </section>
    </TabSection>
  )
}
