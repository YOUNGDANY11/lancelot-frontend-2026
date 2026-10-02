import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useHomeController } from '@/controllers/useHomeController'

export default function HomeView() {
  const { firstName, roleLabel, roleSummary, RoleIcon } = useHomeController()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Hola, ${firstName}`} description="Este es tu inicio en Lancelot." />
      <Card className="glass-subtle">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {RoleIcon && (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <RoleIcon aria-hidden="true" className="size-6" />
            </span>
          )}
          <div>
            <p className="text-sm font-semibold text-primary">{roleLabel}</p>
            <p className="mt-1 max-w-2xl text-pretty text-muted-foreground">{roleSummary}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
