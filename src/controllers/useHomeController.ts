import { ROLE_ICONS, ROLE_LABELS, ROLE_SUMMARIES } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function useHomeController() {
  const { user, role } = useAuth()

  return {
    firstName: user?.name.split(' ')[0] ?? '',
    roleLabel: role ? ROLE_LABELS[role] : '',
    roleSummary: role ? ROLE_SUMMARIES[role] : '',
    RoleIcon: role ? ROLE_ICONS[role] : null,
  }
}
