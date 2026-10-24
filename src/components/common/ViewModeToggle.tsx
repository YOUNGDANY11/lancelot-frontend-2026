import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'cards' | 'table'

export function ViewModeToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="Vista">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ver como tarjetas"
        aria-pressed={value === 'cards'}
        className={cn(value === 'cards' && 'bg-muted')}
        onClick={() => onChange('cards')}
      >
        <LayoutGrid aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ver como tabla"
        aria-pressed={value === 'table'}
        className={cn(value === 'table' && 'bg-muted')}
        onClick={() => onChange('table')}
      >
        <List aria-hidden="true" />
      </Button>
    </div>
  )
}
