import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
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
  const [page, setPage] = useState(1)
  const idSeason = season?.id_season

  const query = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const roster = (query.data ?? [])
    .filter((item) => !category || item.id_category === category.id_category)
    .sort((first, second) =>
      `${first.category_name ?? ''}${fullName(first)}`.localeCompare(
        `${second.category_name ?? ''}${fullName(second)}`,
      ),
    )
  const totalPages = Math.max(1, Math.ceil(roster.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const removeMutation = useResourceMutation({
    mutationFn: (assignment: AthleteAssignment) =>
      athleteAssignmentsService.remove(assignment.id_ath_cat),
    invalidate: [queryKeys.assignments.all],
    successMessage: (assignment) =>
      `${fullName(assignment)} salió de la plantilla de esta temporada.`,
    onSuccess: dialogs.close,
  })

  return {
    season,
    hasSeason: idSeason !== undefined,
    categoryFilterName: category?.name,
    roster: roster.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    pagination: { page: currentPage, limit: PAGE_SIZE, total: roster.length, totalPages },
    setPage,
    missingPositions: roster.filter((item) => !item.position).length,
    isLoading: idSeason !== undefined && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageClub'),
    dialogs,
    confirmRemove: () => dialogs.deleting && removeMutation.mutate(dialogs.deleting),
    isRemoving: removeMutation.isPending,
  }
}
