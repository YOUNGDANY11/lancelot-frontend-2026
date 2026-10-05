import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { AcwrSeriesPoint } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { formatLoad, formatNumber } from '@/utils/formatNumber'

const CONFIG = {
  daily_load: { label: 'Carga diaria', color: 'var(--chart-1)' },
} satisfies ChartConfig

function LoadTooltip(props: TooltipRenderProps<AcwrSeriesPoint>) {
  const point = tooltipDatum(props)
  if (!point) return null
  return (
    <ChartTooltipBox
      title={formatDate(point.date)}
      rows={[
        { label: 'Carga', value: formatLoad(point.daily_load), color: 'var(--chart-1)' },
        { label: 'Sesiones y partidos', value: formatNumber(point.sessions, 0) },
      ]}
    />
  )
}

export function DailyLoadBars({ series }: { series: AcwrSeriesPoint[] }) {
  const withLoad = series.filter((point) => point.daily_load > 0)

  return (
    <ChartCard
      title="Carga diaria"
      description="Suma de RPE × minutos de las sesiones y partidos de cada día."
      helpTerm="trainingLoad"
      isEmpty={withLoad.length === 0}
      emptyMessage="No hay carga registrada en este periodo."
      table={
        <DataTableSimple
          caption="Carga diaria"
          headers={['Fecha', 'Carga (UA)', 'Sesiones']}
          rows={withLoad.map((point) => [
            formatDate(point.date),
            formatNumber(point.daily_load, 0),
            formatNumber(point.sessions, 0),
          ])}
        />
      }
    >
      <ChartContainer config={CONFIG} className="aspect-auto h-56 w-full">
        <BarChart
          data={series}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
          barCategoryGap={2}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickFormatter={(value: string) => formatDate(value, 'dd/MM')}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(value: number) => formatNumber(value, 0)}
          />
          <Tooltip content={<LoadTooltip />} cursor={{ fill: 'var(--muted)' }} />
          <Bar
            dataKey="daily_load"
            fill="var(--color-daily_load)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
