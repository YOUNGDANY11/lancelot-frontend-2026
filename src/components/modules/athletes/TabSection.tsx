import type { ReactNode } from 'react'

interface TabSectionProps {
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function TabSection({ description, action, children }: TabSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      {(description || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {description ? (
            <p className="text-sm text-pretty text-muted-foreground">{description}</p>
          ) : (
            <span />
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
