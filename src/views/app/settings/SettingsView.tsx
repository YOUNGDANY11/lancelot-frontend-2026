import type { ReactNode } from 'react'
import { ModuleTabs } from '@/components/common/ModuleTabs'
import { PageHeader } from '@/components/common/PageHeader'
import { RolesTab } from '@/components/modules/settings/RolesTab'
import { ScopedConfigTab } from '@/components/modules/settings/ScopedConfigTab'
import { UsersTab } from '@/components/modules/settings/UsersTab'
import { WeightProfilesTab } from '@/components/modules/settings/WeightProfilesTab'
import { APP_MODULES } from '@/constants/navigation'
import { SETTINGS_TABS, type SettingsTab } from '@/constants/settings'
import { useRole } from '@/hooks/useRole'

const TAB_CONTENT: Record<SettingsTab, ReactNode> = {
  acwr: <ScopedConfigTab kind="acwr" />,
  riesgo: <ScopedConfigTab kind="risk" />,
  talento: <ScopedConfigTab kind="talent" />,
  pesos: <WeightProfilesTab />,
  usuarios: <UsersTab />,
  roles: <RolesTab />,
}

export default function SettingsView() {
  const { can } = useRole()
  const tabs = SETTINGS_TABS.filter((tab) => can(tab.permission))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={APP_MODULES.settings.label}
        description={APP_MODULES.settings.description}
      />
      <ModuleTabs
        label="Secciones de configuración"
        defaultTab={tabs[0]?.value ?? 'acwr'}
        tabs={tabs.map((tab) => ({
          value: tab.value,
          label: tab.label,
          content: TAB_CONTENT[tab.value],
        }))}
      />
    </div>
  )
}
