import { useQuery } from '@tanstack/react-query'
import { ENGINE_MODE_DESCRIPTIONS } from '@/constants/ml'
import { APP_MODULES } from '@/constants/navigation'
import { ROLE_CODES, ROLE_LABELS, type RoleCode } from '@/constants/roles'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import { usersService } from '@/services/usersService'
import { parseApiError } from '@/utils/parseApiError'
import { resolveRoleCode } from '@/utils/role'

export function useAdminHomeController() {
  const usersQuery = useQuery({ queryKey: queryKeys.users.list(), queryFn: usersService.listAll })
  const engineQuery = useQuery({ queryKey: queryKeys.ml.engine(), queryFn: mlService.engineConfig })
  const readinessQuery = useQuery({
    queryKey: queryKeys.ml.readiness(),
    queryFn: mlService.readiness,
  })
  const qualityQuery = useQuery({
    queryKey: queryKeys.ml.dataQuality({}),
    queryFn: () => mlService.dataQuality(),
  })

  const counts = new Map<RoleCode, number>()
  for (const user of usersQuery.data ?? []) {
    const code = resolveRoleCode(user.role_name, user.id_role)
    if (code) counts.set(code, (counts.get(code) ?? 0) + 1)
  }

  const engine = engineQuery.data?.engine

  return {
    users: {
      byRole: ROLE_CODES.map((code) => ({
        code,
        label: ROLE_LABELS[code],
        count: counts.get(code) ?? 0,
      })),
      total: usersQuery.data?.length ?? 0,
      isLoading: usersQuery.isPending,
      errorMessage: usersQuery.isError ? parseApiError(usersQuery.error) : undefined,
      retry: () => void usersQuery.refetch(),
    },
    engine: {
      mode: engine,
      description: engine ? ENGINE_MODE_DESCRIPTIONS[engine] : undefined,
      isLoading: engineQuery.isPending,
      errorMessage: engineQuery.isError ? parseApiError(engineQuery.error) : undefined,
    },
    readiness: {
      data: readinessQuery.data,
      isLoading: readinessQuery.isPending,
      errorMessage: readinessQuery.isError ? parseApiError(readinessQuery.error) : undefined,
      retry: () => void readinessQuery.refetch(),
    },
    quality: {
      data: qualityQuery.data,
      isLoading: qualityQuery.isPending,
      errorMessage: qualityQuery.isError ? parseApiError(qualityQuery.error) : undefined,
      retry: () => void qualityQuery.refetch(),
    },
    paths: {
      users: APP_MODULES.settings.path,
      analytics: APP_MODULES.analytics.path,
    },
  }
}
