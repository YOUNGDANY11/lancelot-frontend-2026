import { ArrowRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HomeSectionProps {
  id: string
  title: string
  icon: LucideIcon
  description?: string
  linkTo?: string
  linkLabel?: string
  children: ReactNode
  className?: string
}

export function HomeSection({
  id,
  title,
  icon: Icon,
  description,
  linkTo,
  linkLabel = 'Ver todo',
  children,
  className,
}: HomeSectionProps) {
  const headingId = `inicio-${id}`

  return (
    <section
      aria-labelledby={headingId}
      className={cn('flex flex-col gap-4 rounded-2xl glass-subtle p-4 sm:p-5', className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={headingId} className="flex items-center gap-2 text-base font-semibold">
            <Icon aria-hidden="true" className="size-5 text-primary" />
            {title}
          </h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {linkTo && (
          <Button asChild variant="ghost" size="sm">
            <Link to={linkTo}>
              {linkLabel}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </header>
      {children}
    </section>
  )
}
