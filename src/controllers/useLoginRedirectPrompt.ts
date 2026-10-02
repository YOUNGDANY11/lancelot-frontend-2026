import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuthModal } from '@/hooks/useAuthModal'
import type { LoginRedirectState } from '@/routes/ProtectedRoute'

function isLoginRedirectState(state: unknown): state is LoginRedirectState {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as LoginRedirectState).requireLogin === true &&
    typeof (state as LoginRedirectState).from === 'string'
  )
}

export function useLoginRedirectPrompt() {
  const location = useLocation()
  const navigate = useNavigate()
  const { openLogin } = useAuthModal()

  useEffect(() => {
    if (!isLoginRedirectState(location.state)) return
    openLogin({ returnTo: location.state.from })
    navigate(`${location.pathname}${location.hash}`, { replace: true, state: null })
  }, [location, navigate, openLogin])
}
