import { useWatch } from 'react-hook-form'
import { INDICATOR_SUGGESTIONS } from '@/constants/athleteProfile'
import { EVALUATION_DIMENSION, SPORT, type Sport } from '@/constants/enums'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  technicalEvaluationSchemaFor,
  toTechnicalEvaluationRequest,
  type TechnicalEvaluationFormValues,
} from '@/schemas/athleteSchemas'
import { evaluationsService } from '@/services/evaluationsService'
import type { TechnicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'
import { dimensionOf } from '@/utils/technicalScores'

export function useTechnicalEvaluationFormController({
  idUser,
  evaluation,
  knownIndicators,
  sports,
  onDone,
}: {
  idUser: number
  evaluation?: TechnicalEvaluation | null
  knownIndicators: string[]
  sports: Sport[]
  onDone: () => void
}) {
  const playsBoth = sports.length > 1
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = evaluation?.id_season ?? season?.id_season

  const controller = useEntityFormController<TechnicalEvaluationFormValues>({
    schema: technicalEvaluationSchemaFor(playsBoth),
    defaultValues: evaluation
      ? {
          sport: evaluation.sport ?? '',
          dimension: dimensionOf(evaluation),
          indicator: evaluation.indicator,
          score: String(evaluation.score),
          eval_date: evaluation.eval_date,
        }
      : {
          sport: playsBoth ? '' : (sports[0] ?? ''),
          dimension: 'tecnica',
          indicator: '',
          score: '',
          eval_date: todayApiDate(),
        },
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
    fieldMatchers: [{ field: 'sport', pattern: /deporte|juega/i }],
  })

  const [dimension, chosenSport] = useWatch({
    control: controller.form.control,
    name: ['dimension', 'sport'],
  })
  const sport: Sport | null = chosenSport || (sports.length === 1 ? sports[0] : null)

  return {
    ...controller,
    isEditing: Boolean(evaluation),
    seasonName: evaluation?.season_name ?? season?.name,
    dimensionOptions: EVALUATION_DIMENSION.options,
    showSport: playsBoth,
    sportOptions: SPORT.options.filter((option) => sports.includes(option.value)),
    indicatorSuggestions: [
      ...new Set([
        ...knownIndicators,
        ...(sport
          ? INDICATOR_SUGGESTIONS[sport][dimension]
          : [
              ...INDICATOR_SUGGESTIONS.futbol[dimension],
              ...INDICATOR_SUGGESTIONS.futbol_sala[dimension],
            ]),
      ]),
    ],
  }
}
