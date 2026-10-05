import { Bar, BarChart, CartesianGrid, Cell, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/charts/ChartCard'
import { ChartTooltipBox } from '@/components/charts/ChartTooltipBox'
import { tooltipDatum, type TooltipRenderProps } from '@/components/charts/chartTooltip'
import { DataTableSimple } from '@/components/charts/DataTableSimple'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { formatNumber } from '@/utils/formatNumber'
import type { RankingEntry } from '@/utils/talentRanking'

const CONFIG = { value: { label: 'Índice', color: 'var(--chart-1)' } } satisfies ChartConfig
const MAX_BARS = 15
const ROW_HEIGHT = 30

interface RankingDatum {
  id_user: number
  name: string
  value: number
  rank: number
}

function RankingTooltip(props: TooltipRenderProps<RankingDatum>) {
  const datum = tooltipDatum(props)
  if (!datum) return null
  return (
    <ChartTooltipBox
      title={`${datum.rank}. ${datum.name}`}
      rows={[
        {
          label: 'Índice',
          value: `${formatNumber(datum.value, 1)} / 100`,
          color: 'var(--chart-1)',
        },
      ]}
    />
  )
}

interface CategoryRankingBarProps {
  entries: RankingEntry[]
  selectedUser: number | null
  onSelect: (idUser: number) => void
  title: string
}

export function CategoryRankingBar({
  entries,
  selectedUser,
  onSelect,
  title,
}: CategoryRankingBarProps) {
  const data: RankingDatum[] = entries.slice(0, MAX_BARS).map((entry) => ({
    id_user: entry.index.id_user,
    name: entry.athleteName,
    value: entry.index.index_value,
    rank: entry.rank,
  }))

  return (
    <ChartCard
      title={title}
      description={
        entries.length > MAX_BARS
          ? `Los ${MAX_BARS} índices más altos de ${entries.length}. Toca una barra para ver su radar.`
          : 'Índice de 0 a 100. Toca una barra para ver su radar.'
      }
      helpTerm="progressIndex"
      isEmpty={data.length === 0}
      emptyMessage="Aún no hay índices calculados en esta temporada."
      table={
        <DataTableSimple
          caption={title}
          headers={['Puesto', 'Deportista', 'Índice']}
          rows={entries.map((entry) => [
            entry.rank,
            entry.athleteName,
            formatNumber(entry.index.index_value, 1),
          ])}
        />
      }
    >
      <ChartContainer
        config={CONFIG}
        className="aspect-auto w-full"
        style={{ height: Math.max(160, data.length * ROW_HEIGHT + 32) }}
      >
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => formatNumber(value, 0)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<RankingTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
          <Bar
            dataKey="value"
            barSize={16}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
            onClick={(_item, position) => {
              const datum = data[position]
              if (datum) onSelect(datum.id_user)
            }}
            className="cursor-pointer"
          >
            {data.map((datum) => (
              <Cell
                key={datum.id_user}
                fill="var(--color-value)"
                fillOpacity={selectedUser === null || selectedUser === datum.id_user ? 1 : 0.45}
                stroke={selectedUser === datum.id_user ? 'var(--foreground)' : 'none'}
                strokeWidth={selectedUser === datum.id_user ? 1.5 : 0}
              />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              className="fill-muted-foreground text-xs"
              formatter={(value) => formatNumber(Number(value), 1)}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}
