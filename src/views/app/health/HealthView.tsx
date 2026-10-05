import { ModuleTabs, type ModuleTab } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { AlertInboxTab } from '@/components/modules/health/AlertInboxTab'
import { ConsentsTab } from '@/components/modules/health/ConsentsTab'
import { HealthAuditTab } from '@/components/modules/health/HealthAuditTab'
import { HealthRecordsTab } from '@/components/modules/health/HealthRecordsTab'
import { InjuriesTab } from '@/components/modules/health/InjuriesTab'
import { HEALTH_TABS, type HealthTab } from '@/constants/health'
import { APP_MODULES } from '@/constants/navigation'
import { useHealthViewController } from '@/controllers/health/useHealthViewController'

const TAB_CONTENT: Record<HealthTab, ModuleTab<HealthTab>['content']> = {
  alertas: <AlertInboxTab />,
  lesiones: <InjuriesTab />,
  registros: <HealthRecordsTab />,
  consentimientos: <ConsentsTab />,
  auditoria: <HealthAuditTab />,
}

export default function HealthView() {
  const { tabs } = useHealthViewController()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={APP_MODULES.health.label} description={APP_MODULES.health.description} />
      <ModuleTabs
        label="Secciones de salud"
        defaultTab="alertas"
        tabs={HEALTH_TABS.filter((tab) => tabs.includes(tab.value)).map((tab) => ({
          value: tab.value,
          label: tab.label,
          content: TAB_CONTENT[tab.value],
        }))}
      />
    </div>
  )
}
