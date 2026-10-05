import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { CategoriesTab } from '@/components/modules/club/CategoriesTab'
import { CompetitionsTab } from '@/components/modules/club/CompetitionsTab'
import { MatchesTab } from '@/components/modules/club/MatchesTab'
import { RosterTab } from '@/components/modules/club/RosterTab'
import { SeasonsTab } from '@/components/modules/club/SeasonsTab'
import { APP_MODULES } from '@/constants/navigation'

export default function ClubView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={APP_MODULES.club.label} description={APP_MODULES.club.description} />
      <ModuleTabs
        label="Secciones del club"
        defaultTab="temporadas"
        tabs={[
          { value: 'temporadas', label: 'Temporadas', content: <SeasonsTab /> },
          { value: 'categorias', label: 'Categorías', content: <CategoriesTab /> },
          { value: 'competencias', label: 'Competencias', content: <CompetitionsTab /> },
          { value: 'partidos', label: 'Partidos', content: <MatchesTab /> },
          { value: 'plantilla', label: 'Plantilla', content: <RosterTab /> },
        ]}
      />
    </div>
  )
}
