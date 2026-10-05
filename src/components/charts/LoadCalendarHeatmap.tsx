import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChartCard } from '@/components/charts/ChartCard'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import type { AcwrSeriesPoint } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { buildHeatmapWeeks } from '@/utils/loadHeatmap'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const STEP_MIX = [0, 30, 55, 80, 100]

function cellColor(step: number): string {
  return step === 0
    ? 'var(--muted)'
    : `color-mix(in oklab, var(--chart-1) ${STEP_MIX[step]}%, var(--muted))`
}

export function LoadCalendarHeatmap({ series }: { series: AcwrSeriesPoint[] }) {
  const weeks = buildHeatmapWeeks(series)
  const cells = weeks.flat()
  const activeDays = cells.filter((cell) => cell.load > 0)

  return (
    <ChartCard
      title="Calendario de carga"
      description="Las últimas 8 semanas. Cada cuadro es un día; más intenso, más carga."
      helpTerm="trainingLoad"
      isEmpty={activeDays.length === 0}
      emptyMessage="No hay carga registrada en las últimas 8 semanas."
      table={
        <DataTableSimple
          caption="Calendario de carga"
          headers={['Fecha', 'Carga (UA)']}
          rows={activeDays.map((cell) => [formatDate(cell.date), formatNumber(cell.load, 0)])}
        />
      }
      footer={
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Menos</span>
          {STEP_MIX.map((_, step) => (
            <span
              key={step}
              aria-hidden="true"
              className="size-3 rounded-[3px]"
              style={{ backgroundColor: cellColor(step) }}
            />
          ))}
          <span>Más</span>
        </div>
      }
    >
      <div className="flex gap-2 overflow-x-auto">
        <div className="grid grid-rows-7 gap-1 pt-0 text-[0.65rem] text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="flex h-5 items-center">
              {label}
            </span>
          ))}
        </div>
        <div
          className="grid grid-flow-col grid-rows-7 gap-1"
          role="list"
          aria-label="Carga por día"
        >
          {cells.map((cell) => {
            const label = `${format(parseISO(cell.date), "EEEE d 'de' MMMM", { locale: es })}: ${
              cell.load > 0 ? formatLoad(cell.load) : 'sin carga'
            }`
            return (
              <span
                key={cell.date}
                role="listitem"
                aria-label={label}
                title={label}
                className="size-5 rounded-[4px] ring-1 ring-background"
                style={{ backgroundColor: cellColor(cell.step) }}
              />
            )
          })}
        </div>
      </div>
    </ChartCard>
  )
}
