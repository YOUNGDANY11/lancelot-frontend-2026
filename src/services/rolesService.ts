import { ROLE_CODES, type RoleCode } from '@/constants/roles'
import { fetchAllPages, fetchList, type QueryParams } from '@/lib/listRequest'

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
  list(filters: QueryParams) {
    return fetchList<RoleRecord>('/roles', 'roles', filters)
  },

  listAll(): Promise<RoleRecord[]> {
    return fetchAllPages<RoleRecord>('/roles', 'roles')
  },

  async idsByCode(): Promise<Partial<Record<RoleCode, number>>> {
    return mapRoleIdsByCode(await rolesService.listAll())
  },
}
