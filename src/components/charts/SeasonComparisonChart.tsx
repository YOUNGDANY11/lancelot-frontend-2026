import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { SeasonComparisonPoint } from '@/types/athlete'
import { formatNumber } from '@/utils/formatNumber'

const SERIES = [
  { key: 'index_value', label: 'Índice', color: 'var(--chart-1)', width: 3 },
  { key: 'physical_score', label: 'Física', color: 'var(--chart-2)', width: 2 },
  { key: 'technical_score', label: 'Técnica', color: 'var(--chart-3)', width: 2 },
  { key: 'participation_score', label: 'Participación', color: 'var(--chart-4)', width: 2 },
] as const

const CONFIG = Object.fromEntries(
  SERIES.map((series) => [series.key, { label: series.label, color: series.color }]),
) satisfies ChartConfig

function ComparisonTooltip(props: TooltipRenderProps<SeasonComparisonPoint>) {
  const point = tooltipDatum(props)
  if (!point) return null
  return (
    <ChartTooltipBox
      title={point.season_name}
      rows={SERIES.map((series) => ({
        label: series.label,
        value: formatNumber(point[series.key], 1),
        color: series.color,
      }))}
    />
  )
}

export function SeasonComparisonChart({ comparison }: { comparison: SeasonComparisonPoint[] }) {
  const latest = comparison[comparison.length - 1]

  return (
    <ChartCard
      title="Comparación entre temporadas"
      description="Índice de progreso y sus tres dimensiones, de 0 a 100."
      helpTerm="progressIndex"
      isEmpty={comparison.length === 0}
      emptyMessage="Aún no hay índices de progreso calculados para este deportista."
      table={
        <DataTableSimple
          caption="Comparación entre temporadas"
          headers={['Temporada', ...SERIES.map((series) => series.label)]}
          rows={comparison.map((point) => [
            point.season_name,
            ...SERIES.map((series) => formatNumber(point[series.key], 1)),
          ])}
        />
      }
      footer={
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span className="text-muted-foreground">{series.label}</span>
              {latest && (
                <span className="font-medium tabular-nums">
                  {formatNumber(latest[series.key], 1)}
                </span>
              )}
            </li>
          ))}
        </ul>
      }
    >
      {comparison.length === 1 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Solo hay una temporada con índice calculado. La comparación aparece desde la segunda.
        </p>
      ) : (
        <ChartContainer config={CONFIG} className="aspect-auto h-64 w-full">
          <LineChart data={comparison} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="season_name" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<ComparisonTooltip />} cursor={{ stroke: 'var(--border)' }} />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                dataKey={series.key}
                stroke={`var(--color-${series.key})`}
                strokeWidth={series.width}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  stroke: 'var(--background)',
                  fill: `var(--color-${series.key})`,
                }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      )}
    </ChartCard>
  )
}
