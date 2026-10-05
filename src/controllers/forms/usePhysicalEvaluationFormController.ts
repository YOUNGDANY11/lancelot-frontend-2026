import { PHYSICAL_EVALUATION_STAGE, VO2_TEST_METHOD } from '@/constants/enums'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  physicalEvaluationSchema,
  toPhysicalEvaluationRequest,
  type PhysicalEvaluationFormValues,
} from '@/schemas/athleteSchemas'
import { evaluationsService } from '@/services/evaluationsService'
import type { PhysicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

function decimalText(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}

export function usePhysicalEvaluationFormController({
  idUser,
  evaluation,
  onDone,
}: {
  idUser: number
  evaluation?: PhysicalEvaluation | null
  onDone: () => void
}) {
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = evaluation?.id_season ?? season?.id_season

  const controller = useEntityFormController<PhysicalEvaluationFormValues>({
    schema: physicalEvaluationSchema,
    defaultValues: evaluation
      ? {
          stage: evaluation.stage,
          eval_date: evaluation.eval_date,
          height_cm: decimalText(evaluation.height_cm),
          weight_kg: decimalText(evaluation.weight_kg),
          vo2max_estimado: decimalText(evaluation.vo2max_estimado),
          test_method: evaluation.test_method ?? '',
          speed_20m: decimalText(evaluation.speed_20m),
        }
      : {
          stage: 'pre',
          eval_date: todayApiDate(),
          height_cm: '',
          weight_kg: '',
          vo2max_estimado: '',
          test_method: '',
          speed_20m: '',
        },
    submit: (values) => {
      if (idSeason === undefined) throw new Error('Selecciona una temporada.')
      const request = toPhysicalEvaluationRequest(values, {
        idUser,
        idSeason,
        evaluatorId: evaluation ? undefined : user?.id_user,
      })
      return evaluation
        ? evaluationsService.updatePhysical(evaluation.id_eval, request)
        : evaluationsService.createPhysical(request)
    },
    invalidate: [queryKeys.athlete.all(idUser)],
    successMessage: () =>
      evaluation ? 'Evaluación física actualizada.' : 'Evaluación física registrada.',
    onDone,
  })

  return {
    ...controller,
    isEditing: Boolean(evaluation),
    seasonName: evaluation?.season_name ?? season?.name,
    stageOptions: PHYSICAL_EVALUATION_STAGE.options.map(({ value, label }) => ({ value, label })),
    methodOptions: VO2_TEST_METHOD.options.map(({ value, label }) => ({ value, label })),
  }
}
