import type { ReactNode } from 'react'

export interface TooltipRow {
  label: string
  value: string
  color?: string
}

interface ChartTooltipBoxProps {
  title: string
  rows: TooltipRow[]
  footer?: ReactNode
}

export function ChartTooltipBox({ title, rows, footer }: ChartTooltipBoxProps) {
  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <p className="font-semibold">{title}</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {row.color && (
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: row.color }}
              />
            )}
            {row.label}
          </span>
          <span className="font-medium tabular-nums">{row.value}</span>
        </div>
      ))}
      {footer}
    </div>
  )
}
