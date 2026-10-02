import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatusPageProps {
  icon: LucideIcon
  code?: string
  title: string
  description: string
  actions: ReactNode
}

export function StatusPage({ icon: Icon, code, title, description, actions }: StatusPageProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-3xl glass-subtle p-8 text-center sm:p-10">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-7" />
        </span>
        {code && <p className="font-heading text-sm font-semibold text-muted-foreground">{code}</p>}
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">{title}</h1>
        <p className="text-pretty text-muted-foreground">{description}</p>
        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>
      </div>
    </main>
  )
}
