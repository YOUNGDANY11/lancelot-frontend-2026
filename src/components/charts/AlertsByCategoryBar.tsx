import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { RISK_LEVEL, type RiskLevelValue } from '@/constants/enums'
import { RISK_LEVEL_PRESENTATION } from '@/constants/riskLevels'
import type { CategoryAlertCount } from '@/controllers/home/useDirectorHomeController'
import { countLabel } from '@/utils/text'

const LEVELS: RiskLevelValue[] = ['alto', 'medio', 'bajo']

const LEVEL_COLORS: Record<RiskLevelValue, string> = {
  alto: 'var(--risk-high)',
  medio: 'var(--risk-medium)',
  bajo: 'var(--risk-low)',
}

const CONFIG = {
  alto: { label: 'Alto', color: LEVEL_COLORS.alto },
  medio: { label: 'Medio', color: LEVEL_COLORS.medio },
  bajo: { label: 'Bajo', color: LEVEL_COLORS.bajo },
} satisfies ChartConfig

const ROW_HEIGHT = 36

interface CategoryDatum extends Record<RiskLevelValue, number> {
  name: string
  total: number
}

function CategoryTooltip(props: TooltipRenderProps<CategoryDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={datum.name}
      rows={LEVELS.map((level) => ({
        label: `Riesgo ${RISK_LEVEL.labels[level].toLowerCase()}`,
        value: String(datum[level]),
        color: LEVEL_COLORS[level],
      }))}
      footer={countLabel(datum.total, 'pendiente', 'pendientes')}
    />
  )
}

export function AlertsByCategoryBar({ categories }: { categories: CategoryAlertCount[] }) {
  const data: CategoryDatum[] = categories.map((entry) => ({
    name: entry.name,
    ...entry.counts,
    total: entry.counts.alto + entry.counts.medio + entry.counts.bajo,
  }))

  return (
    <ChartCard
      title="Alertas pendientes por categoría"
      description="Alertas de fatiga y evaluaciones de riesgo sin revisar, según la categoría de edad de cada deportista."
      isEmpty={data.length === 0}
      emptyMessage="No hay alertas pendientes."
      table={
        <DataTableSimple
          caption="Alertas pendientes por categoría"
          headers={['Categoría', 'Alto', 'Medio', 'Bajo', 'Total']}
          rows={data.map((datum) => [datum.name, datum.alto, datum.medio, datum.bajo, datum.total])}
        />
      }
      footer={
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {LEVELS.map((level) => {
            const { icon: Icon, label } = RISK_LEVEL_PRESENTATION[level]
            return (
              <li key={level} className="flex items-center gap-1.5">
                <Icon
                  aria-hidden="true"
                  className="size-3.5"
                  style={{ color: LEVEL_COLORS[level] }}
                />
                Riesgo {label.toLowerCase()}
              </li>
            )
          })}
        </ul>
      }
    >
      <ChartContainer
        config={CONFIG}
        className="aspect-auto w-full"
        style={{ height: Math.max(120, data.length * ROW_HEIGHT + 32) }}
      >
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={96}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          {LEVELS.map((level, position) => (
            <Bar
              key={level}
              dataKey={level}
              stackId="nivel"
              name={RISK_LEVEL.labels[level]}
              fill={`var(--color-${level})`}
              stroke="var(--background)"
              strokeWidth={2}
              barSize={18}
              radius={position === LEVELS.length - 1 ? [0, 4, 4, 0] : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
