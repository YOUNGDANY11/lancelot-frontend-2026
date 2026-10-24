import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import type { AthleteAssignment } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

const PAGE_SIZE = 15

export function useRosterTabController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const dialogs = useCrudDialogs<AthleteAssignment>()
  const idSeason = season?.id_season
  const idCategory = category?.id_category
  const { page, setPage, afterRemoval } = usePagination(
    PAGE_SIZE,
    `${idSeason ?? ''}:${idCategory ?? ''}`,
  )

  const scope = { id_season: idSeason, id_category: idCategory }
  const filters = { ...scope, page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: () => athleteAssignmentsService.list(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })
  const missingQuery = useQuery({
    queryKey: queryKeys.assignments.list({ ...scope, missing_position: true, scope: 'count' }),
    queryFn: () => athleteAssignmentsService.count({ ...scope, missing_position: true }),
    enabled: idSeason !== undefined,
  })
  const roster = query.data?.items ?? []

  const removeMutation = useResourceMutation({
    mutationFn: (assignment: AthleteAssignment) =>
      athleteAssignmentsService.remove(assignment.id_ath_cat),
    invalidate: [queryKeys.assignments.all, queryKeys.users.all],
    successMessage: (assignment) =>
      `${fullName(assignment)} salió de la plantilla de esta temporada.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(roster.length)
    },
  })

  return {
    season,
    hasSeason: idSeason !== undefined,
    categoryFilterName: category?.name,
    roster,
    pagination: query.data?.pagination,
    setPage,
    missingPositions: missingQuery.data ?? 0,
    isLoading: idSeason !== undefined && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageClub'),
    dialogs,
    confirmRemove: () => dialogs.deleting && removeMutation.mutate(dialogs.deleting),
    isRemoving: removeMutation.isPending,
  }
}
