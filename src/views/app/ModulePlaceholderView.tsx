import { Construction } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { APP_MODULES, type ModuleKey } from '@/constants/navigation'

interface ModulePlaceholderViewProps {
  moduleKey: ModuleKey
}

export default function ModulePlaceholderView({ moduleKey }: ModulePlaceholderViewProps) {
  const module = APP_MODULES[moduleKey]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={module.label} description={module.description} />
      <EmptyState
        icon={Construction}
        title="Este módulo está en construcción"
        description="Muy pronto podrás trabajar aquí. Mientras tanto, usa los demás módulos del menú."
      />
    </div>
  )
}
