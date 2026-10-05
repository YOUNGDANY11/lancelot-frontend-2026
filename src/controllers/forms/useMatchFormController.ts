import { useQuery } from '@tanstack/react-query'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { matchSchema, toMatchRequest, type MatchFormValues } from '@/schemas/clubSchemas'
import { competitionService } from '@/services/competitionService'
import type { Match } from '@/types/competition'

export function useMatchFormController({
  match,
  onDone,
}: {
  match?: Match | null
  onDone: () => void
}) {
  const { season, category } = useAppContext()
  const idSeason = season?.id_season

  const competenciesQuery = useQuery({
    queryKey: queryKeys.competencies.list(idSeason),
    queryFn: () => competitionService.listCompetencies(idSeason),
    enabled: idSeason !== undefined,
  })
  const competencies = (competenciesQuery.data ?? []).filter(
    (item) => !category || item.id_category === category.id_category,
  )

  const controller = useEntityFormController<MatchFormValues>({
    schema: matchSchema,
    defaultValues: match
      ? {
          id_competency: String(match.id_competency),
          date: match.date.slice(0, 10),
          time: match.time.slice(0, 5),
          location: match.location,
        }
      : { id_competency: '', date: '', time: '', location: '' },
    submit: (values) => {
      const competency = (competenciesQuery.data ?? []).find(
        (item) => item.id_competency === Number(values.id_competency),
      )
      const idCategory = competency?.id_category ?? match?.id_category
      if (idCategory === undefined) throw new Error('Elige una competencia válida.')
      const request = toMatchRequest(values, idCategory)
      return match
        ? competitionService.updateMatch(match.id_match, request)
        : competitionService.createMatch(request)
    },
    invalidate: [queryKeys.matches.all],
    successMessage: () => (match ? 'Partido actualizado.' : 'Partido programado.'),
    onDone,
  })

  return {
    ...controller,
    isEditing: Boolean(match),
    isLoadingCompetencies: competenciesQuery.isPending,
    competencyOptions: competencies.map((item) => ({
      value: String(item.id_competency),
      label: item.name,
    })),
  }
}
