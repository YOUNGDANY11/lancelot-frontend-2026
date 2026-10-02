import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { getRoleHome } from '@/routes/roleHome'

export function useLandingAuthController() {
  const { status, role } = useAuth()
  const { openLogin, openRegister } = useAuthModal()

  return {
    isAuthenticated: status === 'authenticated',
    isRestoringSession: status === 'loading',
    dashboardPath: getRoleHome(role),
    openLogin: () => openLogin(),
    openRegister,
  }
}
