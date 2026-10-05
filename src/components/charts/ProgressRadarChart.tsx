import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, Tooltip } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { ProgressIndex } from '@/types/athlete'
import { formatNumber } from '@/utils/formatNumber'

const CONFIG = { value: { label: 'Puntaje', color: 'var(--chart-1)' } } satisfies ChartConfig

interface DimensionDatum {
  dimension: string
  value: number
}

function RadarTooltip(props: TooltipRenderProps<DimensionDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={datum.dimension}
      rows={[
        {
          label: 'Puntaje',
          value: `${formatNumber(datum.value, 1)} / 100`,
          color: 'var(--chart-1)',
        },
      ]}
    />
  )
}

export function ProgressRadarChart({ index }: { index: ProgressIndex | null }) {
  const data: DimensionDatum[] = index
    ? [
        { dimension: 'Física', value: index.physical_score },
        { dimension: 'Técnica', value: index.technical_score },
        { dimension: 'Participación', value: index.participation_score },
      ]
    : []

  return (
    <ChartCard
      title="Índice de progreso"
      description={
        index ? `Valor del índice: ${formatNumber(index.index_value, 1)} de 100.` : undefined
      }
      helpTerm="progressIndex"
      isEmpty={!index}
      emptyMessage="Aún no se ha calculado el índice de progreso en esta temporada."
      table={
        <DataTableSimple
          caption="Dimensiones del índice de progreso"
          headers={['Dimensión', 'Puntaje']}
          rows={data.map((datum) => [datum.dimension, formatNumber(datum.value, 1)])}
        />
      }
      footer={
        <ul className="grid grid-cols-3 gap-2 text-center text-xs">
          {data.map((datum) => (
            <li key={datum.dimension} className="flex flex-col">
              <span className="text-muted-foreground">{datum.dimension}</span>
              <span className="font-heading text-lg font-semibold tabular-nums">
                {formatNumber(datum.value, 0)}
              </span>
            </li>
          ))}
        </ul>
      }
    >
      <ChartContainer config={CONFIG} className="mx-auto aspect-square h-60 w-full max-w-72">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip content={<RadarTooltip />} />
          <Radar
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            fill="var(--color-value)"
            fillOpacity={0.25}
            dot={{ r: 4, fill: 'var(--color-value)', strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </RadarChart>
      </ChartContainer>
    </ChartCard>
  )
}
