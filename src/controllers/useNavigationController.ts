import type { LucideIcon } from 'lucide-react'
import {
  APP_MODULES,
  MOBILE_PRIMARY_COUNT,
  canAccessModule,
  moduleLabel,
  modulesForRole,
  type ModuleKey,
} from '@/constants/navigation'
import { useAuth } from '@/hooks/useAuth'

export interface NavigationItem {
  key: ModuleKey
  label: string
  path: string
  icon: LucideIcon
}

export function useNavigationController() {
  const { role, user } = useAuth()

  const items: NavigationItem[] = modulesForRole(role).map((module) => ({
    key: module.key,
    label: moduleLabel(module, role),
    icon: module.icon,
    path:
      module.key === 'athletes' && role === 'DEPORTISTA' && user
        ? `${module.path}/${user.id_user}`
        : module.path,
  }))

  const settingsItem: NavigationItem | null = canAccessModule('settings', role)
    ? {
        key: 'settings',
        label: APP_MODULES.settings.label,
        path: APP_MODULES.settings.path,
        icon: APP_MODULES.settings.icon,
      }
    : null

  const primaryItems = items.slice(0, MOBILE_PRIMARY_COUNT)
  const overflowItems = [
    ...items.slice(MOBILE_PRIMARY_COUNT),
    ...(settingsItem ? [settingsItem] : []),
  ]

  return { items, settingsItem, primaryItems, overflowItems }
}
