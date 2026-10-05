import { apiClient } from '@/lib/apiClient'
import { ROLE_CODES, type RoleCode } from '@/constants/roles'

export interface RoleRecord {
  id_role: number
  name: string
  code?: string
}

export function toRoleCode(role: RoleRecord): RoleCode | null {
  const candidates = [role.code, role.name].map((value) => value?.trim().toUpperCase())
  return ROLE_CODES.find((code) => candidates.includes(code)) ?? null
}

export function mapRoleIdsByCode(roles: RoleRecord[]): Partial<Record<RoleCode, number>> {
  return Object.fromEntries(
    roles.flatMap((role) => {
      const code = toRoleCode(role)
      return code ? [[code, role.id_role]] : []
    }),
  )
}

export const rolesService = {
  async list(): Promise<RoleRecord[]> {
    const { data } = await apiClient.http.get<RoleRecord[]>('/roles')
    return Array.isArray(data) ? data : []
  },

  async idsByCode(): Promise<Partial<Record<RoleCode, number>>> {
    return mapRoleIdsByCode(await rolesService.list())
  },
}
