import { Cell, Label, Pie, PieChart, Tooltip } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { RISK_LEVEL, type RiskLevelValue } from '@/constants/enums'
import { RISK_LEVEL_PRESENTATION } from '@/constants/riskLevels'
import type { ReviewStatusTotals } from '@/types/health'

const LEVEL_COLORS: Record<RiskLevelValue, string> = {
  alto: 'var(--risk-high)',
  medio: 'var(--risk-medium)',
  bajo: 'var(--risk-low)',
}

const LEVELS: RiskLevelValue[] = ['alto', 'medio', 'bajo']

const CONFIG = {
  alto: { label: 'Alto', color: LEVEL_COLORS.alto },
  medio: { label: 'Medio', color: LEVEL_COLORS.medio },
  bajo: { label: 'Bajo', color: LEVEL_COLORS.bajo },
} satisfies ChartConfig

interface SliceDatum {
  level: RiskLevelValue
  label: string
  value: number
}

function pendingLabel(total: number) {
  return total === 1 ? '1 pendiente' : `${total} pendientes`
}

function DonutTooltip(props: TooltipRenderProps<SliceDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={`Riesgo ${datum.label.toLowerCase()}`}
      rows={[{ label: 'Pendientes', value: String(datum.value), color: LEVEL_COLORS[datum.level] }]}
    />
  )
}

interface RiskDistributionDonutProps {
  levelCounts: Record<RiskLevelValue, number>
  reviewTotals?: ReviewStatusTotals
  title?: string
}

export function RiskDistributionDonut({
  levelCounts,
  reviewTotals,
  title = 'Alertas pendientes por nivel',
}: RiskDistributionDonutProps) {
  const data: SliceDatum[] = LEVELS.map((level) => ({
    level,
    label: RISK_LEVEL.labels[level],
    value: levelCounts[level],
  })).filter((datum) => datum.value > 0)
  const total = data.reduce((sum, datum) => sum + datum.value, 0)

  return (
    <ChartCard
      title={title}
      description="Alertas de fatiga y evaluaciones de riesgo sin revisar."
      isEmpty={total === 0}
      emptyMessage="No hay alertas pendientes."
      table={
        <DataTableSimple
          caption={title}
          headers={['Nivel', 'Pendientes']}
          rows={LEVELS.map((level) => [RISK_LEVEL.labels[level], levelCounts[level]])}
        />
      }
      footer={
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {LEVELS.map((level) => {
              const { icon: Icon, label } = RISK_LEVEL_PRESENTATION[level]
              return (
                <li key={level} className="flex items-center gap-1.5">
                  <Icon
                    aria-hidden="true"
                    className="size-3.5"
                    style={{ color: LEVEL_COLORS[level] }}
                  />
                  {label}: {levelCounts[level]}
                </li>
              )
            })}
          </ul>
          {reviewTotals && (
            <p>
              Historial: {reviewTotals.reviewed} revisadas · {reviewTotals.dismissed} descartadas
            </p>
          )}
        </div>
      }
    >
      <ChartContainer config={CONFIG} className="mx-auto aspect-square h-52">
        <PieChart>
          <Tooltip content={<DonutTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={58}
            outerRadius={86}
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="var(--background)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((datum) => (
              <Cell key={datum.level} fill={`var(--color-${datum.level})`} />
            ))}
            <Label
              position="center"
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    aria-label={pendingLabel(total)}
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-semibold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 22}
                      className="fill-muted-foreground text-xs"
                    >
                      {total === 1 ? 'pendiente' : 'pendientes'}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </ChartCard>
  )
}
