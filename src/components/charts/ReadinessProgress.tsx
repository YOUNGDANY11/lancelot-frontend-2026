import { CircleCheck, Hourglass } from 'lucide-react'
import { READINESS_LABELS } from '@/constants/ml'
import { cn } from '@/lib/utils'
import type { ReadinessCriterion } from '@/types/ml'
import { formatNumber } from '@/utils/formatNumber'

export function ReadinessProgress({ criteria }: { criteria: ReadinessCriterion[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {criteria.map((criterion) => {
        const label = READINESS_LABELS[criterion.code] ?? criterion.descripcion
        const percent =
          criterion.minimum > 0 ? Math.min(100, (criterion.value / criterion.minimum) * 100) : 100
        const missing = Math.max(criterion.minimum - criterion.value, 0)
        const labelId = `readiness-${criterion.code}`
        return (
          <li key={criterion.code} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span id={labelId} className="font-medium">
                {label}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatNumber(criterion.value, 0)} de {formatNumber(criterion.minimum, 0)}
              </span>
            </div>
            <div
              role="progressbar"
              aria-labelledby={labelId}
              aria-valuemin={0}
              aria-valuemax={criterion.minimum}
              aria-valuenow={Math.min(criterion.value, criterion.minimum)}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn('h-full rounded-full', criterion.met ? 'bg-risk-low' : 'bg-primary')}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {criterion.met ? (
                <>
                  <CircleCheck aria-hidden="true" className="size-3.5 text-risk-low" />
                  Cumple el mínimo
                </>
              ) : (
                <>
                  <Hourglass aria-hidden="true" className="size-3.5" />
                  Faltan {formatNumber(missing, 0)}
                </>
              )}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
