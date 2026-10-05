import { useCallback } from 'react'
import { hasPermission, type Permission } from '@/constants/permissions'
import type { RoleCode } from '@/constants/roles'
import { useAuth } from '@/hooks/useAuth'

export function useRole() {
  const { role } = useAuth()

  const hasRole = useCallback(
    (...allowedRoles: RoleCode[]) => role !== null && allowedRoles.includes(role),
    [role],
  )

  const can = useCallback((permission: Permission) => hasPermission(role, permission), [role])

  return { role, hasRole, can }
}
