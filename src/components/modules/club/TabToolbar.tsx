import type { ReactNode } from 'react'

interface TabToolbarProps {
  description?: ReactNode
  children?: ReactNode
}

export function TabToolbar({ description, children }: TabToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description ? (
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      ) : (
        <span />
      )}
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  )
}
