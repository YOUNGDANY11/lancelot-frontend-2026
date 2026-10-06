import { useQuery } from '@tanstack/react-query'
import { ROLE_LABELS, ROLE_SUMMARIES } from '@/constants/roles'
import { queryKeys } from '@/lib/queryKeys'
import { rolesService, toRoleCode } from '@/services/rolesService'
import { parseApiError } from '@/utils/parseApiError'

export function useRolesTabController() {
  const query = useQuery({ queryKey: queryKeys.roles.list(), queryFn: rolesService.list })

  return {
    roles: [...(query.data ?? [])]
      .sort((first, second) => first.id_role - second.id_role)
      .map((role) => {
        const code = toRoleCode(role)
        return {
          id_role: role.id_role,
          name: role.name,
          label: code ? ROLE_LABELS[code] : role.name,
          summary: code ? ROLE_SUMMARIES[code] : 'Rol no reconocido por la plataforma.',
          recognized: code !== null,
        }
      }),
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
