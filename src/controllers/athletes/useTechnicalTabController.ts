import { useQuery } from '@tanstack/react-query'
import { EVALUATION_DIMENSION, SPORT, type Sport } from '@/constants/enums'
import { useAthleteSports } from '@/controllers/athletes/useAthleteSports'
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
  const indicators = summarizeIndicators(evaluations)
  const sports = useAthleteSports(idUser)
  const evaluatedSports = [
    ...new Set(evaluations.flatMap((evaluation) => (evaluation.sport ? [evaluation.sport] : []))),
  ]
  const showSport = sports.length > 1 || evaluatedSports.length > 1
  const sportGroups: { value: Sport | null; label: string | null }[] = showSport
    ? [...SPORT.options, { value: null, label: 'Sin deporte indicado' }]
    : [{ value: null, label: null }]

  return {
    evaluations: [...evaluations].reverse(),
    indicators,
    sports,
    showSport,
    groups: sportGroups.flatMap((sportGroup) =>
      EVALUATION_DIMENSION.options
        .map((option) => ({
          key: `${sportGroup.value ?? 'sin-deporte'}-${option.value}`,
          label: sportGroup.label ? `${sportGroup.label} · ${option.label}` : option.label,
          items: indicators.filter(
            (summary) =>
              summary.dimension === option.value &&
              (!showSport || summary.sport === sportGroup.value),
          ),
        }))
        .filter((group) => group.items.length > 0),
    ),
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
