import { ROLE_SUMMARIES } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function useHomeController() {
  const { user, role } = useAuth()

  return {
    firstName: user?.name.split(' ')[0] ?? '',
    role,
    roleSummary: role ? ROLE_SUMMARIES[role] : '',
  }
}
