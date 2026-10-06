import type { Permission } from '@/constants/permissions'

export type SettingsTab = 'acwr' | 'riesgo' | 'talento' | 'pesos' | 'usuarios' | 'roles'

export const SETTINGS_TABS: { value: SettingsTab; label: string; permission: Permission }[] = [
  { value: 'acwr', label: 'Umbrales de ACWR', permission: 'manageConfig' },
  { value: 'riesgo', label: 'Reglas de riesgo', permission: 'manageConfig' },
  { value: 'talento', label: 'Reglas de talento', permission: 'manageConfig' },
  { value: 'pesos', label: 'Perfiles de pesos', permission: 'manageConfig' },
  { value: 'usuarios', label: 'Usuarios', permission: 'manageUsers' },
  { value: 'roles', label: 'Roles', permission: 'manageUsers' },
]
