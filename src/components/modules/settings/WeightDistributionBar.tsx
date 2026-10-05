import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeightDistributionBarProps {
  physical: number
  technical: number
  participation: number
  total: number
}

const SEGMENTS = [
  { key: 'physical', label: 'Física', className: 'bg-primary' },
  { key: 'technical', label: 'Técnica', className: 'bg-secondary' },
  { key: 'participation', label: 'Participación', className: 'bg-accent' },
] as const

export function WeightDistributionBar({
  physical,
  technical,
  participation,
  total,
}: WeightDistributionBarProps) {
  const values = { physical, technical, participation }
  const isComplete = total === 100

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Física ${physical} %, técnica ${technical} %, participación ${participation} %. Total ${total} %.`}
      >
        {SEGMENTS.map((segment) => (
          <div
            key={segment.key}
            className={cn('h-full transition-all', segment.className)}
            style={{ width: `${Math.min(values[segment.key], 100)}%` }}
          />
        ))}
      </div>
      <p
        className={cn(
          'flex items-center gap-1.5 text-sm font-medium',
          isComplete ? 'text-risk-low' : 'text-risk-medium',
        )}
      >
        {isComplete ? (
          <CircleCheck aria-hidden="true" className="size-4" />
        ) : (
          <CircleAlert aria-hidden="true" className="size-4" />
        )}
        {isComplete
          ? 'Los pesos suman 100 %.'
          : `Los pesos suman ${total} %. Ajústalos hasta llegar a 100 %.`}
      </p>
    </div>
  )
}
