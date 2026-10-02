import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { toast } from 'sonner'
import { SESSION_MESSAGES } from '@/constants/messages'
import { APP_ROUTES } from '@/constants/routes'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  type SessionEndReason,
} from '@/context/AuthContext'
import { useAuthModal } from '@/hooks/useAuthModal'
import { apiClient } from '@/lib/apiClient'
import { authService } from '@/services/authService'
import { usersService } from '@/services/usersService'
import type { LoginRequest } from '@/types/auth'
import type { User } from '@/types/user'
import { decodeAccessToken, resolveRoleCode } from '@/utils/role'
import { REFRESH_TOKEN_STORAGE_KEY, tokenStorage } from '@/utils/tokenStorage'

interface AuthProviderProps {
  children: ReactNode
}

interface SessionState {
  status: AuthStatus
  user: User | null
  endReason: SessionEndReason | null
}

const ANONYMOUS_SESSION: SessionState = { status: 'anonymous', user: null, endReason: null }

function initialSession(): SessionState {
  return tokenStorage.getRefreshToken()
    ? { status: 'loading', user: null, endReason: null }
    : ANONYMOUS_SESSION
}

async function restoreSession(): Promise<User> {
  if (!tokenStorage.getAccessToken()) await authService.refreshSession()
  return usersService.getMe()
}

function privateReturnPath(pathname: string, search: string): string | undefined {
  return pathname.startsWith(APP_ROUTES.app) ? `${pathname}${search}` : undefined
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<SessionState>(initialSession)
  const queryClient = useQueryClient()
  const { openLogin } = useAuthModal()
  const location = useLocation()
  const locationRef = useRef(location)

  useEffect(() => {
    locationRef.current = location
  }, [location])

  const resetToAnonymous = useCallback(
    (endReason: SessionEndReason) => {
      queryClient.clear()
      setSession({ ...ANONYMOUS_SESSION, endReason })
    },
    [queryClient],
  )

  useEffect(() => {
    if (!tokenStorage.getRefreshToken()) return
    let active = true
    restoreSession()
      .then((user) => {
        if (active) setSession({ status: 'authenticated', user, endReason: null })
      })
      .catch(() => {
        if (active) setSession(ANONYMOUS_SESSION)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(
    () =>
      apiClient.onSessionExpired(() => {
        resetToAnonymous('expired')
        toast.error(SESSION_MESSAGES.expired, { id: 'session-expired' })
        const { pathname, search } = locationRef.current
        openLogin({ returnTo: privateReturnPath(pathname, search) })
      }),
    [openLogin, resetToAnonymous],
  )

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== REFRESH_TOKEN_STORAGE_KEY || event.newValue !== null) return
      tokenStorage.clear()
      resetToAnonymous('signed-out')
      toast.info(SESSION_MESSAGES.closedInOtherTab, { id: 'session-closed-other-tab' })
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [resetToAnonymous])

  const login = useCallback(async (credentials: LoginRequest) => {
    const { token } = await authService.login(credentials)
    tokenStorage.setTokens(token)
    try {
      const user = await usersService.getMe()
      setSession({ status: 'authenticated', user, endReason: null })
      return user
    } catch (error) {
      tokenStorage.clear()
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) await authService.logout(refreshToken)
    } finally {
      tokenStorage.clear()
      resetToAnonymous('signed-out')
    }
  }, [resetToAnonymous])

  const logoutAllDevices = useCallback(async () => {
    await authService.logoutAll()
    tokenStorage.clear()
    resetToAnonymous('signed-out')
  }, [resetToAnonymous])

  const updateUser = useCallback(
    (user: User) => setSession((current) => ({ ...current, user })),
    [],
  )

  const value = useMemo<AuthContextValue>(() => {
    const tokenRoleId = decodeAccessToken(tokenStorage.getAccessToken())?.id_role
    return {
      status: session.status,
      user: session.user,
      endReason: session.endReason,
      role: session.user
        ? resolveRoleCode(session.user.role_name, session.user.id_role ?? tokenRoleId)
        : null,
      login,
      logout,
      logoutAllDevices,
      updateUser,
    }
  }, [session, login, logout, logoutAllDevices, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
