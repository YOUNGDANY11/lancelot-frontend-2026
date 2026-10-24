import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { competitionService } from '@/services/competitionService'
import type { Match } from '@/types/competition'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useMatchesTabController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const dialogs = useCrudDialogs<Match>()
  const idSeason = season?.id_season
  const idCategory = category?.id_category
  const { page, setPage, afterRemoval } = usePagination(
    PAGE_SIZE,
    `${idSeason ?? ''}:${idCategory ?? ''}`,
  )

  const competenciesQuery = useQuery({
    queryKey: queryKeys.competencies.list(idSeason),
    queryFn: () => competitionService.listCompetencies(idSeason),
    enabled: idSeason !== undefined,
  })
  const filters = { id_season: idSeason, id_category: idCategory, page, limit: PAGE_SIZE }
  const matchesQuery = useQuery({
    queryKey: queryKeys.matches.list(filters),
    queryFn: () => competitionService.listMatches(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })
  const matches = matchesQuery.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (match: Match) => competitionService.removeMatch(match.id_match),
    invalidate: [queryKeys.matches.all],
    successMessage: () => 'Partido eliminado.',
    onSuccess: () => {
      dialogs.close()
      afterRemoval(matches.length)
    },
  })

  const failed = competenciesQuery.isError ? competenciesQuery.error : matchesQuery.error

  return {
    season,
    hasSeason: idSeason !== undefined,
    hasCompetencies: (competenciesQuery.data ?? []).length > 0,
    matches,
    pagination: matchesQuery.data?.pagination,
    setPage,
    isLoading: idSeason !== undefined && (competenciesQuery.isPending || matchesQuery.isPending),
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void competenciesQuery.refetch()
      void matchesQuery.refetch()
    },
    canManage: can('manageClub'),
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
