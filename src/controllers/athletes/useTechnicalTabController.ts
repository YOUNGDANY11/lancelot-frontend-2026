import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { evaluationsService } from '@/services/evaluationsService'
import type { TechnicalEvaluation } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'
import { summarizeIndicators } from '@/utils/technicalScores'

export function useTechnicalTabController(idUser: number) {
  const { can } = useRole()
  const { season } = useAppContext()
  const dialogs = useCrudDialogs<TechnicalEvaluation>()
  const query = useQuery({
    queryKey: queryKeys.athlete.technical(idUser),
    queryFn: () => evaluationsService.listTechnical(idUser),
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (evaluation: TechnicalEvaluation) =>
      evaluationsService.removeTechnical(evaluation.id_eval_tech),
    invalidate: [queryKeys.athlete.all(idUser)],
    successMessage: (evaluation) =>
      `Evaluación de ${evaluation.indicator} del ${formatDate(evaluation.eval_date)} eliminada.`,
    onSuccess: dialogs.close,
  })

  const evaluations = query.data ?? []

  return {
    evaluations: [...evaluations].reverse(),
    indicators: summarizeIndicators(evaluations),
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageEvaluations'),
    canCreate: can('manageEvaluations') && season !== null,
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
