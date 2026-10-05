import {
  CartesianGrid,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { RISK_LEVEL, type RiskLevelValue } from '@/constants/enums'
import { RISK_LEVEL_PRESENTATION } from '@/constants/riskLevels'
import type { AcwrThresholds } from '@/types/athlete'
import type { TeamAcwrAthlete } from '@/types/training'
import { formatNumber } from '@/utils/formatNumber'
import { fullName } from '@/utils/text'

const LEVEL_COLORS: Record<RiskLevelValue, string> = {
  bajo: 'var(--risk-low)',
  medio: 'var(--risk-medium)',
  alto: 'var(--risk-high)',
}

const LEVELS: RiskLevelValue[] = ['alto', 'medio', 'bajo']

const CONFIG = {
  bajo: { label: 'Bajo', color: LEVEL_COLORS.bajo },
  medio: { label: 'Medio', color: LEVEL_COLORS.medio },
  alto: { label: 'Alto', color: LEVEL_COLORS.alto },
} satisfies ChartConfig

interface ScatterDatum {
  name: string
  chronic: number
  acwr: number
  level: RiskLevelValue
}

function ScatterTooltip(props: TooltipRenderProps<ScatterDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={datum.name}
      rows={[
        { label: 'ACWR', value: formatNumber(datum.acwr, 2), color: LEVEL_COLORS[datum.level] },
        { label: 'Carga crónica', value: formatNumber(datum.chronic, 0) },
        { label: 'Nivel', value: RISK_LEVEL.labels[datum.level] },
      ]}
    />
  )
}

export function TeamAcwrScatter({
  athletes,
  thresholds,
}: {
  athletes: TeamAcwrAthlete[]
  thresholds: AcwrThresholds
}) {
  const data: ScatterDatum[] = athletes.flatMap((athlete) =>
    athlete.acwr !== null && athlete.level
      ? [
          {
            name: fullName(athlete),
            chronic: athlete.chronic_load,
            acwr: athlete.acwr,
            level: athlete.level,
          },
        ]
      : [],
  )
  const top = Math.max(2, thresholds.medium_max + 0.3, ...data.map((datum) => datum.acwr + 0.2))

  return (
    <ChartCard
      title="ACWR frente a carga crónica"
      description="Arriba: aumento brusco de carga. A la derecha: más preparación acumulada."
      helpTerm="acwr"
      isEmpty={data.length === 0}
      emptyMessage="Nadie de la plantilla tiene carga suficiente para calcular el ACWR en esta fecha."
      table={
        <DataTableSimple
          caption="ACWR frente a carga crónica"
          headers={['Deportista', 'ACWR', 'Carga crónica', 'Nivel']}
          rows={data.map((datum) => [
            datum.name,
            formatNumber(datum.acwr, 2),
            formatNumber(datum.chronic, 0),
            RISK_LEVEL.labels[datum.level],
          ])}
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
                Riesgo {label.toLowerCase()} ({data.filter((datum) => datum.level === level).length}
                )
              </li>
            )
          })}
        </ul>
      }
    >
      <ChartContainer config={CONFIG} className="aspect-auto h-64 w-full">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: -12 }}>
          <CartesianGrid stroke="var(--border)" />
          <XAxis
            type="number"
            dataKey="chronic"
            name="Carga crónica"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatNumber(value, 0)}
          />
          <YAxis
            type="number"
            dataKey="acwr"
            name="ACWR"
            domain={[0, Number(top.toFixed(1))]}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(value: number) => formatNumber(value, 1)}
          />
          <ZAxis range={[90, 90]} />
          <ReferenceLine y={thresholds.low_max} stroke="var(--risk-medium)" strokeDasharray="4 4" />
          <ReferenceLine
            y={thresholds.medium_max}
            stroke="var(--risk-high)"
            strokeDasharray="4 4"
          />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          {LEVELS.map((level) => (
            <Scatter
              key={level}
              name={RISK_LEVEL.labels[level]}
              data={data.filter((datum) => datum.level === level)}
              fill={`var(--color-${level})`}
              stroke="var(--background)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </ScatterChart>
      </ChartContainer>
    </ChartCard>
  )
}
