import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { APP_ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

export interface LoginRedirectState {
  requireLogin: true
  from: string
}

export function ProtectedRoute() {
  const { status, endReason } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Recuperando tu sesión…" />

  if (status === 'anonymous') {
    const state: LoginRedirectState | undefined =
      endReason === 'signed-out'
        ? undefined
        : { requireLogin: true, from: `${location.pathname}${location.search}` }
    return <Navigate to={APP_ROUTES.landing} replace state={state} />
  }

  return <Outlet />
}
