import { useCallback } from 'react'
import type { RoleCode } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function useRole() {
  const { role } = useAuth()

  const hasRole = useCallback(
    (...allowedRoles: RoleCode[]) => role !== null && allowedRoles.includes(role),
    [role],
  )

  return { role, hasRole }
}
