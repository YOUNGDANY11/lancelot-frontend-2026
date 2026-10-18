import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { CategoryEvolutionTab } from '@/components/modules/talent/CategoryEvolutionTab'
import { IndicesTab } from '@/components/modules/talent/IndicesTab'
import { NextCycleTab } from '@/components/modules/talent/NextCycleTab'
import { TalentFlagsTab } from '@/components/modules/talent/TalentFlagsTab'
import { APP_MODULES } from '@/constants/navigation'

export default function TalentView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={APP_MODULES.talent.label} description={APP_MODULES.talent.description} />
      <ModuleTabs
        label="Secciones de talento"
        defaultTab="indices"
        tabs={[
          { value: 'indices', label: 'Índices', content: <IndicesTab /> },
          { value: 'categorias', label: 'Por categoría', content: <CategoryEvolutionTab /> },
          { value: 'senalizaciones', label: 'Señalizaciones', content: <TalentFlagsTab /> },
          { value: 'siguiente-ciclo', label: 'Siguiente ciclo', content: <NextCycleTab /> },
        ]}
      />
    </div>
  )
}
