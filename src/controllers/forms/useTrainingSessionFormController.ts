import { TRAINING_SESSION_TYPE } from '@/constants/enums'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import {
  toTrainingSessionRequest,
  trainingSessionSchema,
  type TrainingSessionFormValues,
} from '@/schemas/trainingSchemas'
import { trainingService } from '@/services/trainingService'
import type { TrainingSession } from '@/types/training'
import { formatDate, todayApiDate } from '@/utils/formatDate'

const DEFAULT_DURATION = '90'

export function useTrainingSessionFormController({
  session,
  onDone,
}: {
  session?: TrainingSession | null
  onDone: () => void
}) {
  const { season, category, categories } = useAppContext()
  const idSeason = session?.id_season ?? season?.id_season

  const controller = useEntityFormController<TrainingSessionFormValues>({
    schema: trainingSessionSchema,
    defaultValues: session
      ? {
          id_category: String(session.id_category),
          date: session.date,
          type: session.type,
          planned_duration_min: String(session.planned_duration_min),
        }
      : {
          id_category: category ? String(category.id_category) : '',
          date: todayApiDate(),
          type: 'mixto',
          planned_duration_min: DEFAULT_DURATION,
        },
    submit: (values) => {
      if (idSeason === undefined) throw new Error('Selecciona una temporada.')
      const request = toTrainingSessionRequest(values, idSeason)
      return session
        ? trainingService.updateSession(session.id_session, request)
        : trainingService.createSession(request)
    },
    invalidate: [queryKeys.training.all],
    successMessage: (values) =>
      session
        ? `Sesión del ${formatDate(values.date)} actualizada.`
        : `Sesión del ${formatDate(values.date)} programada.`,
    onDone,
  })

  return {
    ...controller,
    isEditing: Boolean(session),
    seasonName: season?.name,
    categoryOptions: categories.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
    typeOptions: TRAINING_SESSION_TYPE.options.map(({ value, label }) => ({ value, label })),
  }
}
