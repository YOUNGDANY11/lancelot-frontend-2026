import { ChartColumn, Table2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { HelpHint } from '@/components/common/HelpHint'
import { Button } from '@/components/ui/button'
import type { GlossaryKey } from '@/constants/glossary'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  helpTerm?: GlossaryKey
  isEmpty?: boolean
  emptyMessage?: string
  table?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  helpTerm,
  isEmpty = false,
  emptyMessage = 'Aún no hay datos suficientes para este gráfico.',
  table,
  footer,
  children,
  className,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className={cn('flex flex-col gap-4 rounded-2xl glass-subtle p-4 sm:p-5', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 text-base font-semibold">
            {title}
            {helpTerm && <HelpHint term={helpTerm} />}
          </h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {table && !isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTable((current) => !current)}
            aria-pressed={showTable}
          >
            {showTable ? <ChartColumn aria-hidden="true" /> : <Table2 aria-hidden="true" />}
            {showTable ? 'Ver gráfico' : 'Ver tabla'}
          </Button>
        )}
      </header>
      {isEmpty ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : showTable ? (
        <div className="overflow-x-auto">{table}</div>
      ) : (
        children
      )}
      {footer && !isEmpty && footer}
    </section>
  )
}
