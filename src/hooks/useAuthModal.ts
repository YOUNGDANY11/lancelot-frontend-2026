import { useContext } from 'react'
import { AuthModalContext, type AuthModalContextValue } from '@/context/AuthModalContext'

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext)
  if (!context) throw new Error('useAuthModal debe usarse dentro de AuthModalProvider')
  return context
}
