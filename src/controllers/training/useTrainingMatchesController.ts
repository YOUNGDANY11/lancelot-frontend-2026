import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useAppContext } from '@/hooks/useAppContext'
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
  const [page, setPage] = useState(1)
  const [statsMatch, setStatsMatch] = useState<Match | null>(null)
  const idSeason = season?.id_season

  const competenciesQuery = useQuery({
    queryKey: queryKeys.competencies.list(idSeason),
    queryFn: () => competitionService.listCompetencies(idSeason),
    enabled: idSeason !== undefined,
  })
  const matchFilters = { id_category: category?.id_category, scope: 'all' }
  const matchesQuery = useQuery({
    queryKey: queryKeys.matches.list(matchFilters),
    queryFn: () => competitionService.listAllMatches({ id_category: category?.id_category }),
    enabled: idSeason !== undefined,
  })

  const today = todayApiDate()
  const seasonCompetencyIds = new Set(
    (competenciesQuery.data ?? []).map((item) => item.id_competency),
  )
  const matches = (matchesQuery.data ?? [])
    .filter((match) => seasonCompetencyIds.has(match.id_competency))
    .sort((first, second) =>
      `${second.date}${second.time}`.localeCompare(`${first.date}${first.time}`),
    )
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const failed = competenciesQuery.error ?? matchesQuery.error

  return {
    hasSeason: idSeason !== undefined,
    seasonName: season?.name,
    matches: matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    pagination: { page: currentPage, limit: PAGE_SIZE, total: matches.length, totalPages },
    setPage,
    isLoading: idSeason !== undefined && (competenciesQuery.isPending || matchesQuery.isPending),
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void competenciesQuery.refetch()
      void matchesQuery.refetch()
    },
    canRecord: can('manageClub'),
    isPlayed: (match: Match) => match.date.slice(0, 10) <= today,
    statsMatch,
    openStats: setStatsMatch,
    closeStats: () => setStatsMatch(null),
  }
}
