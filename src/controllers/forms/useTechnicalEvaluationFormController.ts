import { TECHNICAL_INDICATOR_SUGGESTIONS } from '@/constants/athleteProfile'
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

export function useTechnicalEvaluationFormController({
  idUser,
  evaluation,
  knownIndicators,
  onDone,
}: {
  idUser: number
  evaluation?: TechnicalEvaluation | null
  knownIndicators: string[]
  onDone: () => void
}) {
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = evaluation?.id_season ?? season?.id_season

  const controller = useEntityFormController<TechnicalEvaluationFormValues>({
    schema: technicalEvaluationSchema,
    defaultValues: evaluation
      ? {
          indicator: evaluation.indicator,
          score: String(evaluation.score),
          eval_date: evaluation.eval_date,
        }
      : { indicator: '', score: '', eval_date: todayApiDate() },
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

  return {
    ...controller,
    isEditing: Boolean(evaluation),
    seasonName: evaluation?.season_name ?? season?.name,
    indicatorSuggestions: [...new Set([...knownIndicators, ...TECHNICAL_INDICATOR_SUGGESTIONS])],
  }
}
