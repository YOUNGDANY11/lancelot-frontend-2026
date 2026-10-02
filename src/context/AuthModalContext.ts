import { createContext } from 'react'

export type AuthModalView = 'login' | 'register'

export interface OpenLoginOptions {
  email?: string
  returnTo?: string
}

export interface AuthModalContextValue {
  view: AuthModalView | null
  prefilledEmail: string | undefined
  returnTo: string | undefined
  openLogin: (options?: OpenLoginOptions) => void
  openRegister: () => void
  close: () => void
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(null)
