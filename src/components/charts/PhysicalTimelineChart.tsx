import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { PHYSICAL_EVALUATION_STAGE } from '@/constants/enums'
import type { PhysicalEvaluation } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

type PhysicalMetric = 'vo2max_estimado' | 'speed_20m' | 'weight_kg'

const METRICS: { key: PhysicalMetric; title: string; unit: string; hint: string }[] = [
  {
    key: 'vo2max_estimado',
    title: 'VO₂ máx. estimado',
    unit: 'ml/kg/min',
    hint: 'Más alto es mejor.',
  },
  { key: 'speed_20m', title: 'Velocidad en 20 m', unit: 's', hint: 'Menos segundos es mejor.' },
  { key: 'weight_kg', title: 'Peso', unit: 'kg', hint: 'Seguimiento del crecimiento.' },
]

const CONFIG = { value: { label: 'Valor', color: 'var(--chart-1)' } } satisfies ChartConfig

interface MetricPoint {
  date: string
  value: number
  stage: PhysicalEvaluation['stage']
}

interface MetricTooltipProps extends TooltipRenderProps<MetricPoint> {
  metricTitle: string
  unit: string
}

function MetricTooltip({ metricTitle, unit, ...props }: MetricTooltipProps) {
  const point = tooltipDatum(props)
  if (!point) return null
  return (
    <ChartTooltipBox
      title={formatDate(point.date)}
      rows={[
        {
          label: metricTitle,
          value: `${formatNumber(point.value, 2)} ${unit}`,
          color: 'var(--chart-1)',
        },
        { label: 'Etapa', value: PHYSICAL_EVALUATION_STAGE.labels[point.stage] },
      ]}
    />
  )
}

function MetricSparkline({
  title,
  unit,
  hint,
  points,
}: {
  title: string
  unit: string
  hint: string
  points: MetricPoint[]
}) {
  const latest = points[points.length - 1]

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="font-heading text-lg font-semibold tabular-nums">
          {latest ? `${formatNumber(latest.value, 2)} ${unit}` : '—'}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {points.length < 2 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          {points.length === 0
            ? 'Sin mediciones.'
            : 'Se necesita una segunda medición para ver la tendencia.'}
        </p>
      ) : (
        <ChartContainer config={CONFIG} className="aspect-auto h-32 w-full">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => formatDate(value, 'MM/yy')}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              domain={['auto', 'auto']}
              tickFormatter={(value: number) => formatNumber(value, 1)}
            />
            <Tooltip
              content={<MetricTooltip metricTitle={title} unit={unit} />}
              cursor={{ stroke: 'var(--border)' }}
            />
            <Line
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{
                r: 4,
                strokeWidth: 2,
                stroke: 'var(--background)',
                fill: 'var(--color-value)',
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}

export function PhysicalTimelineChart({ evaluations }: { evaluations: PhysicalEvaluation[] }) {
  const series = METRICS.map((metric) => ({
    ...metric,
    points: evaluations.flatMap((evaluation) => {
      const value = evaluation[metric.key]
      return typeof value === 'number'
        ? [{ date: evaluation.eval_date, value, stage: evaluation.stage }]
        : []
    }),
  }))

  return (
    <ChartCard
      title="Evolución física"
      description="Cada métrica tiene su propia escala, por eso se muestran por separado."
      isEmpty={evaluations.length === 0}
      emptyMessage="Aún no hay evaluaciones físicas registradas."
      table={
        <DataTableSimple
          caption="Evaluaciones físicas"
          headers={['Fecha', 'Etapa', 'VO₂ máx.', '20 m (s)', 'Peso (kg)', 'Talla (cm)']}
          rows={evaluations.map((evaluation) => [
            formatDate(evaluation.eval_date),
            PHYSICAL_EVALUATION_STAGE.labels[evaluation.stage],
            formatNumber(evaluation.vo2max_estimado, 2),
            formatNumber(evaluation.speed_20m, 2),
            formatNumber(evaluation.weight_kg, 2),
            formatNumber(evaluation.height_cm, 2),
          ])}
        />
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {series.map((metric) => (
          <MetricSparkline
            key={metric.key}
            title={metric.title}
            unit={metric.unit}
            hint={metric.hint}
            points={metric.points}
          />
        ))}
      </div>
    </ChartCard>
  )
}
