import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { evaluationsService } from '@/services/evaluationsService'
import type { PhysicalEvaluation } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

export function usePhysicalTabController(idUser: number) {
  const { can } = useRole()
  const { season } = useAppContext()
  const dialogs = useCrudDialogs<PhysicalEvaluation>()
  const query = useQuery({
    queryKey: queryKeys.athlete.physical(idUser),
    queryFn: () => evaluationsService.listPhysical(idUser),
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (evaluation: PhysicalEvaluation) =>
      evaluationsService.removePhysical(evaluation.id_eval),
    invalidate: [queryKeys.athlete.physical(idUser), queryKeys.athlete.all(idUser)],
    successMessage: (evaluation) => `Evaluación del ${formatDate(evaluation.eval_date)} eliminada.`,
    onSuccess: dialogs.close,
  })

  return {
    evaluations: query.data ?? [],
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageEvaluations'),
    canCreate: can('manageEvaluations') && season !== null,
    seasonName: season?.name,
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
