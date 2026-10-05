import { Activity, ClipboardList, Goal, Shirt, TrendingUp } from 'lucide-react'
import { EvolutionTab } from '@/components/modules/athletes/EvolutionTab'
import { ObjectivesTab } from '@/components/modules/athletes/ObjectivesTab'
import { HomeSection } from '@/components/modules/home/HomeSection'
import { MyLoadSummary } from '@/components/modules/training/MyLoadSummary'
import { MyRpeReport } from '@/components/modules/training/MyRpeReport'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'

export function AthleteHome() {
  const { user } = useAuth()
  const { categories, season } = useAppContext()
  const idUser = user?.id_user
  const categoryNames = categories.map((category) => category.name).join(' · ')

  return (
    <div className="flex flex-col gap-5">
      <HomeSection
        id="mi-categoria"
        title="Mi categoría"
        icon={Shirt}
        description={season ? `Temporada ${season.name}` : undefined}
      >
        <p className="text-lg font-semibold">
          {categoryNames || 'Aún no tienes categoría en esta temporada'}
        </p>
      </HomeSection>

      <HomeSection
        id="mi-rpe"
        title="Reportar mi RPE de hoy"
        icon={ClipboardList}
        description="Qué tan dura sentiste la sesión, de 0 a 10. Mejor unos 30 minutos después de terminar."
        linkTo={APP_MODULES.training.path}
        linkLabel="Mi entrenamiento"
      >
        <MyRpeReport />
      </HomeSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <HomeSection id="mi-carga" title="Mi carga" icon={Activity}>
          <MyLoadSummary />
        </HomeSection>
        {idUser !== undefined && (
          <HomeSection id="mis-objetivos" title="Mis objetivos" icon={Goal}>
            <ObjectivesTab idUser={idUser} />
          </HomeSection>
        )}
      </div>

      {idUser !== undefined && (
        <HomeSection id="mi-evolucion" title="Mi evolución" icon={TrendingUp}>
          <EvolutionTab idUser={idUser} />
        </HomeSection>
      )}
    </div>
  )
}
