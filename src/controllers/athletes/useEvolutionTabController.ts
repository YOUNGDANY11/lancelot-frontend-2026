import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { reportsService } from '@/services/reportsService'
import { parseApiError } from '@/utils/parseApiError'

export function useEvolutionTabController(idUser: number) {
  const { can } = useRole()
  const { seasons } = useAppContext()
  const canSeeComparison = can('viewSeasonComparison')
  const canSeeHistory = can('viewAssignmentHistory')

  const comparisonQuery = useQuery({
    queryKey: queryKeys.athlete.comparison(idUser),
    queryFn: () => reportsService.seasonComparison(idUser),
    enabled: canSeeComparison,
  })
  const historyQuery = useQuery({
    queryKey: queryKeys.assignments.history(idUser),
    queryFn: () => athleteAssignmentsService.history(idUser),
    enabled: canSeeHistory,
  })

  const seasonNames = new Map(seasons.map((season) => [season.id_season, season.name]))
  const seasonStart = new Map(seasons.map((season) => [season.id_season, season.start_date]))
  const history = [...(historyQuery.data ?? [])]
    .map((item) => ({
      ...item,
      seasonName: item.id_season
        ? (seasonNames.get(item.id_season) ?? 'Temporada')
        : 'Sin temporada',
      seasonStart: item.id_season ? (seasonStart.get(item.id_season) ?? '') : '',
    }))
    .sort((first, second) => second.seasonStart.localeCompare(first.seasonStart))

  return {
    comparison: {
      visible: canSeeComparison,
      points: comparisonQuery.data ?? [],
      isLoading: comparisonQuery.isPending,
      errorMessage: comparisonQuery.isError ? parseApiError(comparisonQuery.error) : undefined,
      retry: () => void comparisonQuery.refetch(),
    },
    history: {
      visible: canSeeHistory,
      items: history,
      isLoading: historyQuery.isPending,
      errorMessage: historyQuery.isError ? parseApiError(historyQuery.error) : undefined,
      retry: () => void historyQuery.refetch(),
    },
  }
}
