import type { StatusTone } from '@/constants/enums'
import { cn } from '@/lib/utils'

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  info: 'border-primary/30 bg-primary/10 text-primary',
  success: 'border-risk-low/40 bg-risk-low/10 text-risk-low',
  warning: 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium',
  danger: 'border-risk-high/40 bg-risk-high/10 text-risk-high',
}

interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  className?: string
}

export function StatusBadge({ label, tone = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
