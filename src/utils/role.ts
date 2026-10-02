import { jwtDecode } from 'jwt-decode'
import { ROLE_CODE_BY_ID, ROLE_CODES, type RoleCode } from '@/constants/roles'
import type { AccessTokenPayload } from '@/types/auth'

function isRoleCode(value: unknown): value is RoleCode {
  return ROLE_CODES.includes(value as RoleCode)
}

export function decodeAccessToken(token: string | null): AccessTokenPayload | null {
  if (!token) return null
  try {
    return jwtDecode<AccessTokenPayload>(token)
  } catch {
    return null
  }
}

export function resolveRoleCode(
  roleName: string | null | undefined,
  roleId: number | null | undefined,
): RoleCode | null {
  if (isRoleCode(roleName)) return roleName
  if (roleId !== null && roleId !== undefined) return ROLE_CODE_BY_ID[roleId] ?? null
  return null
}
