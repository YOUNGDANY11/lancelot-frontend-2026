import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { competitionService } from '@/services/competitionService'
import type { Match } from '@/types/competition'
import { todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useTrainingMatchesController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const [statsMatch, setStatsMatch] = useState<Match | null>(null)
  const idSeason = season?.id_season
  const idCategory = category?.id_category
  const { page, setPage } = usePagination(PAGE_SIZE, `${idSeason ?? ''}:${idCategory ?? ''}`)

  const filters = { id_season: idSeason, id_category: idCategory, page, limit: PAGE_SIZE }
  const matchesQuery = useQuery({
    queryKey: queryKeys.matches.list(filters),
    queryFn: () => competitionService.listMatches(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })

  const today = todayApiDate()

  return {
    hasSeason: idSeason !== undefined,
    seasonName: season?.name,
    matches: matchesQuery.data?.items ?? [],
    pagination: matchesQuery.data?.pagination,
    setPage,
    isLoading: idSeason !== undefined && matchesQuery.isPending,
    errorMessage: matchesQuery.isError ? parseApiError(matchesQuery.error) : undefined,
    retry: () => void matchesQuery.refetch(),
    canRecord: can('manageClub'),
    isPlayed: (match: Match) => match.date.slice(0, 10) <= today,
    statsMatch,
    openStats: setStatsMatch,
    closeStats: () => setStatsMatch(null),
  }
}
