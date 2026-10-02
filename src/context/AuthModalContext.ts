import { createContext } from 'react'

export type AuthModalView = 'login' | 'register'

export interface AuthModalContextValue {
  view: AuthModalView | null
  prefilledEmail: string | undefined
  openLogin: (email?: string) => void
  openRegister: () => void
  close: () => void
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(null)
