import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { IndicesTab } from '@/components/modules/talent/IndicesTab'
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
          { value: 'senalizaciones', label: 'Señalizaciones', content: <TalentFlagsTab /> },
        ]}
      />
    </div>
  )
}
