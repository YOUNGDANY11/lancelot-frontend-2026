import { DEVELOPMENT_OBJECTIVE_STATUS } from '@/constants/enums'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  objectiveSchema,
  toObjectiveRequest,
  type ObjectiveFormValues,
} from '@/schemas/athleteSchemas'
import { objectivesService } from '@/services/objectivesService'
import type { DevelopmentObjective } from '@/types/athlete'

export function useObjectiveFormController({
  idUser,
  objective,
  onDone,
}: {
  idUser: number
  objective?: DevelopmentObjective | null
  onDone: () => void
}) {
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = objective?.id_season ?? season?.id_season

  const controller = useEntityFormController<ObjectiveFormValues>({
    schema: objectiveSchema,
    defaultValues: objective
      ? {
          description: objective.description,
          target_date: objective.target_date,
          status: objective.status,
        }
      : { description: '', target_date: '', status: 'open' },
    submit: (values) => {
      const setBy = objective?.set_by ?? user?.id_user
      if (idSeason === undefined || setBy === undefined)
        throw new Error('Selecciona una temporada.')
      const request = toObjectiveRequest(values, { idUser, idSeason, setBy })
      return objective
        ? objectivesService.update(objective.id_objective, request)
        : objectivesService.create(request)
    },
    invalidate: [queryKeys.athlete.objectives(idUser)],
    successMessage: () => (objective ? 'Objetivo actualizado.' : 'Objetivo creado.'),
    onDone,
  })

  return {
    ...controller,
    isEditing: Boolean(objective),
    seasonName: objective?.season_name ?? season?.name,
    statusOptions: DEVELOPMENT_OBJECTIVE_STATUS.options.map(({ value, label }) => ({
      value,
      label,
    })),
  }
}
