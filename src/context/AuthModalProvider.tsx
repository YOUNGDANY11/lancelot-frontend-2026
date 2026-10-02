import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  AuthModalContext,
  type AuthModalContextValue,
  type AuthModalView,
  type OpenLoginOptions,
} from '@/context/AuthModalContext'

interface AuthModalProviderProps {
  children: ReactNode
}

interface AuthModalState {
  view: AuthModalView | null
  prefilledEmail: string | undefined
  returnTo: string | undefined
}

const CLOSED_STATE: AuthModalState = {
  view: null,
  prefilledEmail: undefined,
  returnTo: undefined,
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [state, setState] = useState<AuthModalState>(CLOSED_STATE)

  const openLogin = useCallback(
    (options?: OpenLoginOptions) =>
      setState((current) => ({
        view: 'login',
        prefilledEmail: options?.email,
        returnTo: options?.returnTo ?? current.returnTo,
      })),
    [],
  )

  const openRegister = useCallback(
    () => setState((current) => ({ ...current, view: 'register', prefilledEmail: undefined })),
    [],
  )

  const close = useCallback(() => setState(CLOSED_STATE), [])

  const value = useMemo<AuthModalContextValue>(
    () => ({ ...state, openLogin, openRegister, close }),
    [state, openLogin, openRegister, close],
  )

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
}
