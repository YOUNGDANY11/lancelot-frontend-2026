import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { EVALUATION_DIMENSION, type EvaluationDimension } from '@/constants/enums'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { evaluationsService } from '@/services/evaluationsService'
import type { TechnicalEvaluation } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'
import { averageOfLatest, summarizeIndicators } from '@/utils/technicalScores'

export function useTechnicalTabController(idUser: number) {
  const { can } = useRole()
  const { season } = useAppContext()
  const dialogs = useCrudDialogs<TechnicalEvaluation>()
  const [createDimension, setCreateDimension] = useState<EvaluationDimension>('tecnica')
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
  const summaries = summarizeIndicators(evaluations)
  const dimensions = EVALUATION_DIMENSION.options.map((option) => {
    const indicators = summaries.filter((summary) => summary.dimension === option.value)
    return {
      dimension: option.value,
      label: option.label,
      indicators,
      average: averageOfLatest(indicators),
    }
  })

  return {
    evaluations: [...evaluations].reverse(),
    dimensions,
    hasEvaluations: evaluations.length > 0,
    createDimension,
    openCreate: (dimension: EvaluationDimension) => {
      setCreateDimension(dimension)
      dialogs.openCreate()
    },
    dimensionLabel: (dimension: EvaluationDimension) => EVALUATION_DIMENSION.labels[dimension],
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
