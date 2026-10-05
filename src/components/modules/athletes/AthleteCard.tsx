import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { AthleteDirectoryEntry } from '@/utils/athleteDirectory'
import { fullName, initialsOf } from '@/utils/text'

interface AthleteCardProps {
  entry: AthleteDirectoryEntry
  href: string
}

export function AthleteCard({ entry, href }: AthleteCardProps) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-2xl glass-subtle p-4 transition-colors hover:border-primary/40 focus-visible:border-primary"
    >
      <Avatar className="size-12">
        <AvatarFallback className="bg-primary/15 font-semibold text-primary">
          {initialsOf(entry)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{fullName(entry)}</span>
        <span className="truncate text-sm text-muted-foreground">
          {[
            entry.category_name ?? 'Sin categoría',
            entry.position,
            entry.age !== null ? `${entry.age} años` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
