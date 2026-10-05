import { ModuleTabs, type ModuleTab } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { MyLoadSummary } from '@/components/modules/training/MyLoadSummary'
import { MyRpeReport } from '@/components/modules/training/MyRpeReport'
import { SessionsTab } from '@/components/modules/training/SessionsTab'
import { TeamLoadTab } from '@/components/modules/training/TeamLoadTab'
import { TrainingMatchesTab } from '@/components/modules/training/TrainingMatchesTab'
import { APP_MODULES } from '@/constants/navigation'
import {
  useTrainingViewController,
  type TrainingTab,
} from '@/controllers/training/useTrainingViewController'

const TAB_CONTENT: Record<TrainingTab, ModuleTab<TrainingTab>> = {
  sesiones: { value: 'sesiones', label: 'Sesiones', content: <SessionsTab /> },
  partidos: { value: 'partidos', label: 'Partidos', content: <TrainingMatchesTab /> },
  carga: { value: 'carga', label: 'Carga del equipo', content: <TeamLoadTab /> },
}

function AthleteTraining() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mi entrenamiento"
        description="Reporta qué tan duras fueron tus sesiones y sigue tu carga."
      />
      <section aria-labelledby="mi-rpe" className="flex flex-col gap-3">
        <h2 id="mi-rpe" className="text-lg font-semibold">
          Reportar mi RPE
        </h2>
        <MyRpeReport />
      </section>
      <MyLoadSummary />
    </div>
  )
}

export default function TrainingView() {
  const { isAthlete, tabs } = useTrainingViewController()

  if (isAthlete) return <AthleteTraining />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={APP_MODULES.training.label}
        description={APP_MODULES.training.description}
      />
      <ModuleTabs
        label="Secciones de entrenamiento"
        defaultTab={tabs[0]}
        tabs={tabs.map((tab) => TAB_CONTENT[tab])}
      />
    </div>
  )
}
