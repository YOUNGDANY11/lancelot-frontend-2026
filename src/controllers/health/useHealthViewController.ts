import { HEALTH_TABS, type HealthTab } from '@/constants/health'
import { useRole } from '@/hooks/useRole'

export function useHealthViewController() {
  const { can } = useRole()
  const tabs: HealthTab[] = HEALTH_TABS.filter((tab) => !tab.permission || can(tab.permission)).map(
    (tab) => tab.value,
  )
  return { tabs }
}
