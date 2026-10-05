import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import {
  competencySchema,
  toCompetencyRequest,
  type CompetencyFormValues,
} from '@/schemas/clubSchemas'
import { competitionService } from '@/services/competitionService'
import type { Competency } from '@/types/competition'

export function useCompetencyFormController({
  competency,
  onDone,
}: {
  competency?: Competency | null
  onDone: () => void
}) {
  const { season, category, categories } = useAppContext()
  const idSeason = competency?.id_season ?? season?.id_season

  const controller = useEntityFormController<CompetencyFormValues>({
    schema: competencySchema,
    defaultValues: competency
      ? {
          name: competency.name,
          description: competency.description ?? '',
          id_category: String(competency.id_category),
          start_date: competency.start_date,
          finish: competency.finish_date ?? '',
        }
      : {
          name: '',
          description: '',
          id_category: category ? String(category.id_category) : '',
          start_date: '',
          finish: '',
        },
    submit: async (values) => {
      if (idSeason === undefined) throw new Error('Selecciona una temporada.')
      const request = toCompetencyRequest(values, idSeason)
      return competency
        ? competitionService.updateCompetency(competency.id_competency, request)
        : competitionService.createCompetency(request)
    },
    invalidate: [queryKeys.competencies.all],
    successMessage: (values) =>
      competency ? `Competencia ${values.name} actualizada.` : `Competencia ${values.name} creada.`,
    onDone,
  })

  return {
    ...controller,
    isEditing: Boolean(competency),
    seasonName: season?.name,
    categoryOptions: categories.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
  }
}
