import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ROLE_LABELS, ROLE_SUMMARIES } from '@/constants/roles'
import { usePagination } from '@/hooks/usePagination'
import { queryKeys } from '@/lib/queryKeys'
import { rolesService, toRoleCode } from '@/services/rolesService'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useRolesTabController() {
  const { page, setPage } = usePagination(PAGE_SIZE)
  const filters = { page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.roles.page(filters),
    queryFn: () => rolesService.list(filters),
    placeholderData: keepPreviousData,
  })

  return {
    roles: (query.data?.items ?? []).map((role) => {
      const code = toRoleCode(role)
      return {
        id_role: role.id_role,
        name: role.name,
        label: code ? ROLE_LABELS[code] : role.name,
        summary: code ? ROLE_SUMMARIES[code] : 'Rol no reconocido por la plataforma.',
        recognized: code !== null,
      }
    }),
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
