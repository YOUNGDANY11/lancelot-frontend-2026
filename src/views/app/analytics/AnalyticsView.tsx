import type { ReactNode } from 'react'
import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { DataQualityTab } from '@/components/modules/analytics/DataQualityTab'
import { DataTab } from '@/components/modules/analytics/DataTab'
import { EngineTab } from '@/components/modules/analytics/EngineTab'
import { ModelsTab } from '@/components/modules/analytics/ModelsTab'
import { ReadinessTab } from '@/components/modules/analytics/ReadinessTab'
import { ValidationTab } from '@/components/modules/analytics/ValidationTab'
import { ANALYTICS_TABS, type AnalyticsTab } from '@/constants/ml'
import { APP_MODULES } from '@/constants/navigation'
import { useRole } from '@/hooks/useRole'

const TAB_CONTENT: Record<AnalyticsTab, ReactNode> = {
  motor: <EngineTab />,
  readiness: <ReadinessTab />,
  calidad: <DataQualityTab />,
  modelos: <ModelsTab />,
  validacion: <ValidationTab />,
  datos: <DataTab />,
}

export default function AnalyticsView() {
  const { can } = useRole()
  const tabs = ANALYTICS_TABS.filter((tab) => can(tab.permission))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={APP_MODULES.analytics.label}
        description={APP_MODULES.analytics.description}
      />
      <ModuleTabs
        label="Secciones de análisis"
        defaultTab={tabs[0]?.value ?? 'validacion'}
        tabs={tabs.map((tab) => ({
          value: tab.value,
          label: tab.label,
          content: TAB_CONTENT[tab.value],
        }))}
      />
    </div>
  )
}
