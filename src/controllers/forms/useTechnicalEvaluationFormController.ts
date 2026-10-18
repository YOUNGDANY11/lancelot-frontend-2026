import { useQuery } from '@tanstack/react-query'
import { EVALUATION_DIMENSION, type EvaluationDimension } from '@/constants/enums'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  technicalEvaluationSchema,
  toTechnicalEvaluationRequest,
  type TechnicalEvaluationFormValues,
} from '@/schemas/athleteSchemas'
import { evaluationsService } from '@/services/evaluationsService'
import type { TechnicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

export function useTechnicalEvaluationFormController({
  idUser,
  evaluation,
  defaultDimension = 'tecnica',
  onDone,
}: {
  idUser: number
  evaluation?: TechnicalEvaluation | null
  defaultDimension?: EvaluationDimension
  onDone: () => void
}) {
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = evaluation?.id_season ?? season?.id_season
  const catalogQuery = useQuery({
    queryKey: queryKeys.evaluationCatalog(),
    queryFn: evaluationsService.technicalCatalog,
    staleTime: Infinity,
  })

  const controller = useEntityFormController<TechnicalEvaluationFormValues>({
    schema: technicalEvaluationSchema,
    defaultValues: evaluation
      ? {
          dimension: evaluation.dimension,
          indicator: evaluation.indicator,
          score: String(evaluation.score),
          eval_date: evaluation.eval_date,
        }
      : { dimension: defaultDimension, indicator: '', score: '', eval_date: todayApiDate() },
    submit: (values) => {
      const evaluatorId = evaluation?.evaluator_id ?? user?.id_user
      if (idSeason === undefined || evaluatorId === undefined) {
        throw new Error('Selecciona una temporada.')
      }
      const request = toTechnicalEvaluationRequest(values, { idUser, idSeason, evaluatorId })
      return evaluation
        ? evaluationsService.updateTechnical(evaluation.id_eval_tech, request)
        : evaluationsService.createTechnical(request)
    },
    invalidate: [queryKeys.athlete.all(idUser)],
    successMessage: (values) =>
      evaluation
        ? `Evaluación de ${values.indicator} actualizada.`
        : `Evaluación de ${values.indicator} registrada.`,
    onDone,
  })

  const { form } = controller
  const dimension = form.watch('dimension')
  const catalogIndicators =
    catalogQuery.data?.find((entry) => entry.dimension === dimension)?.indicators ?? []
  const legacyIndicator =
    evaluation &&
    evaluation.dimension === dimension &&
    !catalogIndicators.includes(evaluation.indicator)
      ? [evaluation.indicator]
      : []

  return {
    ...controller,
    isEditing: Boolean(evaluation),
    seasonName: evaluation?.season_name ?? season?.name,
    dimensionOptions: EVALUATION_DIMENSION.options.map(({ value, label }) => ({ value, label })),
    indicatorOptions: [...legacyIndicator, ...catalogIndicators].map((indicator) => ({
      value: indicator,
      label: indicator,
    })),
    isCatalogLoading: catalogQuery.isPending,
    catalogError: catalogQuery.isError ? parseApiError(catalogQuery.error) : undefined,
    changeDimension: (value: string) => {
      form.setValue('dimension', value as EvaluationDimension, { shouldValidate: true })
      form.setValue('indicator', '', { shouldValidate: false })
    },
  }
}
