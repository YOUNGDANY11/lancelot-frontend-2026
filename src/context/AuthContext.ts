import { createContext } from 'react'
import type { RoleCode } from '@/constants/roles'
import type { LoginRequest } from '@/types/auth'
import type { User } from '@/types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type SessionEndReason = 'expired' | 'signed-out'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  role: RoleCode | null
  endReason: SessionEndReason | null
  login: (credentials: LoginRequest) => Promise<User>
  logout: () => Promise<void>
  logoutAllDevices: () => Promise<void>
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
