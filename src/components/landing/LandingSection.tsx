import type { ReactNode } from 'react'
import { Reveal } from '@/components/landing/Reveal'
import { cn } from '@/lib/utils'

interface LandingSectionProps {
  id: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: LandingSectionProps) {
  const titleId = `${id}-titulo`

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('scroll-mt-24 py-16 sm:py-24', className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
          <h2 id={titleId} className="mt-3 text-3xl font-semibold text-balance sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}
