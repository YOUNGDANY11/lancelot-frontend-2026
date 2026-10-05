import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { usersService } from '@/services/usersService'
import { buildAthleteDirectory, filterAthleteDirectory } from '@/utils/athleteDirectory'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 12

export type DirectoryViewMode = 'cards' | 'table'

export function useAthleteDirectoryController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const assignDialog = useDisclosure()
  const [search, setSearch] = useState('')
  const [onlyUnassigned, setOnlyUnassigned] = useState(false)
  const [viewMode, setViewMode] = useState<DirectoryViewMode>('cards')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 250)
  const idSeason = season?.id_season

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const directory = buildAthleteDirectory(athletesQuery.data ?? [], assignmentsQuery.data ?? [])
  const filtered = filterAthleteDirectory(directory, {
    search: debouncedSearch,
    idCategory: category?.id_category ?? null,
    onlyUnassigned,
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const failed = athletesQuery.isError ? athletesQuery.error : assignmentsQuery.error

  return {
    season,
    categoryName: category?.name,
    entries: filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    totalAthletes: directory.length,
    unassignedCount: directory.filter((entry) => entry.id_category === null).length,
    pagination: { page: currentPage, limit: PAGE_SIZE, total: filtered.length, totalPages },
    setPage,
    search,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    onlyUnassigned,
    toggleUnassigned: () => {
      setOnlyUnassigned((current) => !current)
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
