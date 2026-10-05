import { CartesianGrid, Line, LineChart, ReferenceArea, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { ACWR_ZONE_LABELS } from '@/constants/athleteProfile'
import { RISK_LEVEL } from '@/constants/enums'
import type { AcwrSeriesPoint, AcwrThresholds } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

interface AcwrTrendChartProps {
  series: AcwrSeriesPoint[]
  thresholds: AcwrThresholds
  title?: string
}

const CONFIG = { acwr: { label: 'ACWR', color: 'var(--chart-1)' } } satisfies ChartConfig

function zones(thresholds: AcwrThresholds, top: number) {
  return [
    {
      key: 'underload',
      label: ACWR_ZONE_LABELS.underload,
      from: 0,
      to: thresholds.low_min,
      color: 'var(--muted-foreground)',
    },
    {
      key: 'safe',
      label: ACWR_ZONE_LABELS.safe,
      from: thresholds.low_min,
      to: thresholds.low_max,
      color: 'var(--risk-low)',
    },
    {
      key: 'watch',
      label: ACWR_ZONE_LABELS.watch,
      from: thresholds.low_max,
      to: thresholds.medium_max,
      color: 'var(--risk-medium)',
    },
    {
      key: 'overload',
      label: ACWR_ZONE_LABELS.overload,
      from: thresholds.medium_max,
      to: top,
      color: 'var(--risk-high)',
    },
  ]
}

function AcwrTooltip(props: TooltipRenderProps<AcwrSeriesPoint>) {
  const point = tooltipDatum(props)
  if (!point) return null
  return (
    <ChartTooltipBox
      title={formatDate(point.date)}
      rows={[
        { label: 'ACWR', value: formatNumber(point.acwr, 2), color: 'var(--chart-1)' },
        { label: 'Nivel', value: point.level ? RISK_LEVEL.labels[point.level] : '—' },
        { label: 'Carga aguda', value: formatNumber(point.acute_load, 0) },
        { label: 'Carga crónica', value: formatNumber(point.chronic_load, 0) },
      ]}
    />
  )
}

export function AcwrTrendChart({
  series,
  thresholds,
  title = 'Tendencia del ACWR',
}: AcwrTrendChartProps) {
  const values = series
    .map((point) => point.acwr)
    .filter((value): value is number => value !== null)
  const top = Math.max(2, thresholds.medium_max + 0.4, ...values.map((value) => value + 0.2))
  const bands = zones(thresholds, top)

  return (
    <ChartCard
      title={title}
      description="Relación entre la carga de los últimos 7 días y la de los últimos 28."
      helpTerm="acwr"
      isEmpty={values.length === 0}
      emptyMessage="Aún no hay carga registrada suficiente para calcular el ACWR."
      table={
        <DataTableSimple
          caption={title}
          headers={['Fecha', 'ACWR', 'Nivel']}
          rows={series
            .filter((point) => point.acwr !== null)
            .map((point) => [
              formatDate(point.date),
              formatNumber(point.acwr, 2),
              point.level ? RISK_LEVEL.labels[point.level] : '—',
            ])}
        />
      }
      footer={
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {bands.map((band) => (
            <li key={band.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-3 rounded-[3px] opacity-60"
                style={{ backgroundColor: band.color }}
              />
              {band.label}
              {band.key === 'overload'
                ? ` (más de ${formatNumber(band.from, 2)})`
                : ` (${formatNumber(band.from, 2)} – ${formatNumber(band.to, 2)})`}
            </li>
          ))}
        </ul>
      }
    >
      <ChartContainer config={CONFIG} className="aspect-auto h-64 w-full">
        <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          {bands.map((band) => (
            <ReferenceArea
              key={band.key}
              y1={band.from}
              y2={band.to}
              fill={band.color}
              fillOpacity={0.1}
              stroke="none"
              ifOverflow="hidden"
            />
          ))}
          <CartesianGrid vertical={false} strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={28}
            tickFormatter={(value: string) => formatDate(value, 'dd/MM')}
          />
          <YAxis
            domain={[0, Number(top.toFixed(1))]}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => formatNumber(value, 1)}
          />
          <Tooltip content={<AcwrTooltip />} cursor={{ stroke: 'var(--border)' }} />
          <Line
            dataKey="acwr"
            type="monotone"
            stroke="var(--color-acwr)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}
