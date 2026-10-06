import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import { parseApiError } from '@/utils/parseApiError'

export function useReadinessTabController() {
  const query = useQuery({ queryKey: queryKeys.ml.readiness(), queryFn: mlService.readiness })
  const readiness = query.data
  const pending = (readiness?.criteria ?? []).filter((criterion) => !criterion.met)

  return {
    readiness,
    pendingCount: pending.length,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
