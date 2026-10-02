import { RISK_LEVEL_PRESENTATION, type RiskLevel } from '@/constants/riskLevels'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: RiskLevel
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const { label, icon: Icon, className: levelClassName } = RISK_LEVEL_PRESENTATION[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        levelClassName,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label}
    </span>
  )
}
