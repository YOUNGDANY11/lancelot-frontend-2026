import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { ViewMode } from '@/components/common/ViewModeToggle'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { usersService } from '@/services/usersService'
import { buildAthleteDirectory } from '@/utils/athleteDirectory'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 12

export function useAthleteDirectoryController() {
  const { season, category, categories } = useAppContext()
  const { can } = useRole()
  const assignDialog = useDisclosure()
  const [search, setSearch] = useState('')
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const debouncedSearch = useDebounce(search, 250)
  const idSeason = season?.id_season
  const scope = `${idSeason ?? ''}:${category?.id_category ?? ''}`
  const [pageState, setPageState] = useState({ scope, page: 1 })
  const page = pageState.scope === scope ? pageState.page : 1
  const setPage = (next: number) => setPageState({ scope, page: next })

  const filters = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    id_season: idSeason,
    id_category: onlyUnassigned ? undefined : category?.id_category,
    unassigned: onlyUnassigned && idSeason !== undefined ? true : undefined,
  }
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athleteSearch(filters),
    queryFn: () => usersService.searchAthletes(filters),
    placeholderData: keepPreviousData,
  })
  const totalQuery = useQuery({
    queryKey: queryKeys.users.athleteCount({}),
    queryFn: () => usersService.countAthletes(),
  })
  const unassignedQuery = useQuery({
    queryKey: queryKeys.users.athleteCount({ id_season: idSeason, unassigned: true }),
    queryFn: () => usersService.countAthletes({ id_season: idSeason, unassigned: true }),
    enabled: idSeason !== undefined,
  })
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const maxAgeById = new Map(
    categories.flatMap((item) =>
      item.max_age !== undefined ? [[item.id_category, item.max_age] as const] : [],
    ),
  )
  const entries = buildAthleteDirectory(
    athletesQuery.data?.items ?? [],
    assignmentsQuery.data ?? [],
    maxAgeById,
  )
  const totalAthletes = totalQuery.data ?? 0
  const failed = athletesQuery.isError ? athletesQuery.error : assignmentsQuery.error

  return {
    season,
    categoryName: category?.name,
    entries,
    totalAthletes,
    unassignedCount: idSeason === undefined ? totalAthletes : (unassignedQuery.data ?? 0),
    pagination: athletesQuery.data?.pagination,
    setPage,
    search,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    onlyUnassigned,
    toggleUnassigned: () => {
      setOnlyUnassigned(!onlyUnassigned)
      setPage(1)
    },
    viewMode,
    setViewMode,
    isLoading: athletesQuery.isPending || (idSeason !== undefined && assignmentsQuery.isPending),
    errorMessage: failed ? parseApiError(failed) : undefined,
    retry: () => {
      void athletesQuery.refetch()
      void assignmentsQuery.refetch()
    },
    canAssign: can('manageClub') && idSeason !== undefined,
    assignDialog,
    profilePath: (idUser: number) => `${APP_MODULES.athletes.path}/${idUser}`,
  }
}
