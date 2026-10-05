import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { objectivesService } from '@/services/objectivesService'
import type { DevelopmentObjective } from '@/types/athlete'
import { parseApiError } from '@/utils/parseApiError'

const STATUS_ORDER = { open: 0, achieved: 1, missed: 2 } as const

export function useObjectivesTabController(idUser: number) {
  const { can } = useRole()
  const { season } = useAppContext()
  const dialogs = useCrudDialogs<DevelopmentObjective>()
  const query = useQuery({
    queryKey: queryKeys.athlete.objectives(idUser),
    queryFn: () => objectivesService.list(idUser),
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (objective: DevelopmentObjective) =>
      objectivesService.remove(objective.id_objective),
    invalidate: [queryKeys.athlete.objectives(idUser)],
    successMessage: () => 'Objetivo eliminado.',
    onSuccess: dialogs.close,
  })

  const objectives = [...(query.data ?? [])].sort(
    (first, second) =>
      STATUS_ORDER[first.status] - STATUS_ORDER[second.status] ||
      first.target_date.localeCompare(second.target_date),
  )

  return {
    objectives,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageObjectives'),
    canCreate: can('manageObjectives') && season !== null,
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
