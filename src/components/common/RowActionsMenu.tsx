import { Ellipsis, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface RowAction {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  destructive?: boolean
}

interface RowActionsMenuProps {
  subject: string
  actions: RowAction[]
}

export function RowActionsMenu({ subject, actions }: RowActionsMenuProps) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Más acciones para ${subject}`}>
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {actions.map(({ label, icon: Icon, onSelect, destructive }) => (
          <DropdownMenuItem
            key={label}
            onSelect={onSelect}
            variant={destructive ? 'destructive' : 'default'}
          >
            {Icon && <Icon aria-hidden="true" />}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
