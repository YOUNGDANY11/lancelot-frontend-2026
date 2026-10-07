import { BellCheck, Scale } from 'lucide-react'
import { RiskDistributionDonut } from '@/components/charts/RiskDistributionDonut'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { AlertCard } from '@/components/modules/health/AlertCard'
import { Button } from '@/components/ui/button'
import { RISK_LEVEL, type RiskLevelValue } from '@/constants/enums'
import { INBOX_COPY, INBOX_KIND_FILTERS } from '@/constants/health'
import { useAlertInboxController } from '@/controllers/health/useAlertInboxController'

const LEVEL_FILTERS: { value: RiskLevelValue | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los niveles' },
  ...(['alto', 'medio', 'bajo'] as const).map((value) => ({
    value,
    label: RISK_LEVEL.labels[value],
  })),
]

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  counts,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  counts?: Partial<Record<T, number>>
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? 'secondary' : 'ghost'}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {counts?.[option.value] !== undefined && (
            <span className="text-muted-foreground tabular-nums">({counts[option.value]})</span>
          )}
        </Button>
      ))}
    </div>
  )
}

export function AlertInboxTab() {
  const controller = useAlertInboxController({ withTotals: true })

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <Scale aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-semibold">{INBOX_COPY.decisionNote}</p>
            <p className="text-pretty text-muted-foreground">{INBOX_COPY.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FilterChips
            label="Tipo de alerta"
            options={INBOX_KIND_FILTERS}
            value={controller.kind}
            onChange={controller.setKind}
            counts={controller.kindCounts}
          />
          <FilterChips
            label="Nivel de riesgo"
            options={LEVEL_FILTERS}
            value={controller.level}
            onChange={controller.setLevel}
          />
        </div>

        {controller.isLoading ? (
          <LoadingSkeleton variant="cards" rows={3} label="Cargando la bandeja de alertas" />
        ) : controller.errorMessage ? (
          <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
        ) : controller.items.length === 0 ? (
          <EmptyState
            icon={BellCheck}
            title={controller.totalOpen === 0 ? INBOX_COPY.empty : 'Ninguna alerta con ese filtro'}
            description={controller.totalOpen === 0 ? INBOX_COPY.emptyDescription : undefined}
          />
        ) : (
          <ul aria-label="Alertas pendientes" className="flex flex-col gap-3">
            {controller.items.map((item) => (
              <li key={item.key}>
                <AlertCard
                  item={item}
                  athletePath={controller.athletePath(item)}
                  isPending={controller.pendingKey === item.key}
                  onDecide={(status) => controller.decide(item, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside aria-label="Resumen de alertas" className="flex flex-col gap-4">
        <RiskDistributionDonut
          levelCounts={controller.levelCounts}
          reviewTotals={controller.reviewTotals}
        />
      </aside>
    </div>
  )
}
