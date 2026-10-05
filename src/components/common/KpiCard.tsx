import type { LucideIcon } from 'lucide-react'
import { HelpHint } from '@/components/common/HelpHint'
import type { GlossaryKey } from '@/constants/glossary'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  helpTerm?: GlossaryKey
  className?: string
}

export function KpiCard({ label, value, hint, icon: Icon, helpTerm, className }: KpiCardProps) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl glass-subtle p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          {label}
          {helpTerm && <HelpHint term={helpTerm} />}
        </p>
        {Icon && <Icon aria-hidden="true" className="size-5 text-primary" />}
      </div>
      <p className="text-kpi">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
