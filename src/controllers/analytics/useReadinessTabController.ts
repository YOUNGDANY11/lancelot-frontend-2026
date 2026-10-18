import { useQuery } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import { parseApiError } from '@/utils/parseApiError'

export function useReadinessTabController() {
  const { can } = useRole()
  const showTalent = can('runTalentDetection')
  const query = useQuery({ queryKey: queryKeys.ml.readiness(), queryFn: mlService.readiness })
  const talentQuery = useQuery({
    queryKey: queryKeys.ml.talentReadiness(),
    queryFn: mlService.talentReadiness,
    enabled: showTalent,
  })
  const readiness = query.data
  const pending = (readiness?.criteria ?? []).filter((criterion) => !criterion.met)
  const talentReadiness = talentQuery.data

  return {
    readiness,
    pendingCount: pending.length,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    showTalent,
    talentReadiness,
    talentPendingCount: (talentReadiness?.criteria ?? []).filter((criterion) => !criterion.met)
      .length,
    talentErrorMessage: talentQuery.isError ? parseApiError(talentQuery.error) : undefined,
    retryTalent: () => void talentQuery.refetch(),
  }
}
