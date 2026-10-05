import { Suspense, type ComponentType } from 'react'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { PageHeader } from '@/components/common/PageHeader'
import type { RoleCode } from '@/constants/roles'
import { useHomeController } from '@/controllers/useHomeController'
import {
  AdminHome,
  AthleteHome,
  CoachHome,
  DirectorHome,
  HealthHome,
} from '@/views/app/home/roleHomes'

const HOME_BY_ROLE: Record<RoleCode, ComponentType> = {
  ADMIN: AdminHome,
  DIRECTOR_TECNICO: DirectorHome,
  ENTRENADOR: CoachHome,
  ENCARGADO_SALUD: HealthHome,
  DEPORTISTA: AthleteHome,
}

export default function HomeView() {
  const { firstName, role, roleSummary } = useHomeController()
  const RoleHome = role ? HOME_BY_ROLE[role] : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Hola, ${firstName}`} description={roleSummary} />
      {RoleHome && (
        <Suspense
          fallback={<LoadingSkeleton variant="cards" rows={3} label="Cargando tu inicio" />}
        >
          <RoleHome />
        </Suspense>
      )}
    </div>
  )
}
