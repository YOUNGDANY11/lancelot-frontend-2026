import { useQuery } from '@tanstack/react-query'
import { useDateRange } from '@/hooks/useDateRange'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import { usersService } from '@/services/usersService'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

const WORST_LIMIT = 10

export function useDataQualityTabController() {
  const range = useDateRange(28)
  const params = { from: range.from, to: range.to }

  const query = useQuery({
    queryKey: queryKeys.ml.dataQuality(params),
    queryFn: () => mlService.dataQuality(params),
    enabled: range.isValid,
  })
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })

  const names = new Map(
    (athletesQuery.data ?? []).map((athlete) => [athlete.id_user, fullName(athlete)]),
  )
  const quality = query.data
  const worst = [...(quality?.load_days.per_athlete ?? [])]
    .filter((row) => row.days_without_load_pct !== null)
    .sort(
      (first, second) => (second.days_without_load_pct ?? 0) - (first.days_without_load_pct ?? 0),
    )
    .slice(0, WORST_LIMIT)
    .map((row) => ({ ...row, name: names.get(row.id_user) ?? `Deportista ${row.id_user}` }))

  return {
    range,
    quality,
    worst,
    isLoading: range.isValid && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
  }
}
