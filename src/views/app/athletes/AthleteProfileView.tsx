import { ArrowLeft, UserX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ModuleTabs } from '@/components/common/ModuleTabs'
import { AthleteSummaryTab } from '@/components/modules/athletes/AthleteSummaryTab'
import { EvolutionTab } from '@/components/modules/athletes/EvolutionTab'
import { HealthTab } from '@/components/modules/athletes/HealthTab'
import { LoadTab } from '@/components/modules/athletes/LoadTab'
import { ObjectivesTab } from '@/components/modules/athletes/ObjectivesTab'
import { PhysicalTab } from '@/components/modules/athletes/PhysicalTab'
import { TechnicalTab } from '@/components/modules/athletes/TechnicalTab'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { AthleteProfileTab } from '@/constants/athleteProfile'
import { APP_MODULES } from '@/constants/navigation'
import { APP_ROUTES } from '@/constants/routes'
import { useAthleteProfileController } from '@/controllers/athletes/useAthleteProfileController'
import { formatDate } from '@/utils/formatDate'

export default function AthleteProfileView() {
  const { id_user: rawId } = useParams()
  const controller = useAthleteProfileController(rawId)

  if (controller.isForbidden) return <Navigate to={APP_ROUTES.forbidden} replace />
  if (controller.isLoading)
    return <LoadingSkeleton variant="cards" rows={4} label="Cargando la ficha" />
  if (controller.errorMessage) {
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
  }
  if (controller.isNotFound || controller.idUser === null || !controller.athlete) {
    return (
      <EmptyState
        icon={UserX}
        title="No encontramos este deportista"
        description="Puede que el enlace no sea correcto o que la cuenta ya no exista."
        action={
          <Button asChild variant="outline">
            <Link to={APP_MODULES.athletes.path}>Volver al directorio</Link>
          </Button>
        }
      />
    )
  }

  const idUser = controller.idUser
  const content: Record<AthleteProfileTab, ReactNode> = {
    resumen: <AthleteSummaryTab idUser={idUser} />,
    fisico: <PhysicalTab idUser={idUser} />,
    tecnico: <TechnicalTab idUser={idUser} />,
    carga: <LoadTab idUser={idUser} />,
    salud: <HealthTab idUser={idUser} birthDate={controller.birthDate} />,
    objetivos: <ObjectivesTab idUser={idUser} />,
    evolucion: <EvolutionTab idUser={idUser} />,
  }

  return (
    <div className="flex flex-col gap-6">
      {controller.email !== undefined && (
        <Link
          to={APP_MODULES.athletes.path}
          className="inline-flex w-fit items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Directorio de deportistas
        </Link>
      )}

      <header className="flex flex-col gap-4 rounded-2xl glass-subtle p-5 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary/15 font-heading text-xl font-semibold text-primary">
            {controller.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-balance">{controller.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {[
              controller.categoryName ?? 'Sin categoría en esta temporada',
              controller.position,
              controller.age !== null ? `${controller.age} años` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="text-xs text-muted-foreground">
            {[
              controller.birthDate ? `Nació el ${formatDate(controller.birthDate)}` : null,
              controller.email,
              controller.seasonName ? `Temporada ${controller.seasonName}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </header>

      <ModuleTabs
        label="Secciones de la ficha"
        defaultTab={controller.defaultTab}
        tabs={controller.tabs.map((tab) => ({ ...tab, content: content[tab.value] }))}
      />
    </div>
  )
}
