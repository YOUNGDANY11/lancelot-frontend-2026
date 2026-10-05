import { APP_MODULES } from '@/constants/navigation'
import { useAuth } from '@/hooks/useAuth'

export function useAthleteSelfRedirect(): string | null {
  const { role, user } = useAuth()
  return role === 'DEPORTISTA' && user ? `${APP_MODULES.athletes.path}/${user.id_user}` : null
}
