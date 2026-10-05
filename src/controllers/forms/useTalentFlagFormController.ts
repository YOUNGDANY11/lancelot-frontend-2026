import { useQuery } from '@tanstack/react-query'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { talentFlagSchema, type TalentFlagFormValues } from '@/schemas/clubSchemas'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { talentService } from '@/services/talentService'
import { fullName } from '@/utils/text'

export function useTalentFlagFormController({ onDone }: { onDone: () => void }) {
  const { season } = useAppContext()
  const { user } = useAuth()
  const idSeason = season?.id_season
  const filters = { id_season: idSeason, scope: 'all' }

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const byUser = new Map<number, AthleteOption>()
  for (const assignment of assignmentsQuery.data ?? []) {
    const current = byUser.get(assignment.id_user)
    byUser.set(assignment.id_user, {
      id: assignment.id_user,
      label: fullName(assignment),
      hint: [current?.hint, assignment.category_name].filter(Boolean).join(' · ') || undefined,
    })
  }
  const athleteOptions = [...byUser.values()].sort((first, second) =>
    first.label.localeCompare(second.label, 'es'),
  )

  const controller = useEntityFormController<TalentFlagFormValues>({
    schema: talentFlagSchema,
    defaultValues: { id_user: 0, criteria: '', recommended_action: '' },
    submit: (values) => {
      if (idSeason === undefined || user?.id_user === undefined)
        throw new Error('Selecciona una temporada.')
      return talentService.createFlag({
        id_user: values.id_user,
        id_season: idSeason,
        criteria: values.criteria.trim(),
        recommended_action: values.recommended_action.trim(),
        created_by: user.id_user,
      })
    },
    invalidate: [queryKeys.talent.all, queryKeys.athlete.root],
    successMessage: (values) =>
      `Señalización de ${byUser.get(values.id_user)?.label ?? 'el deportista'} registrada.`,
    onDone,
    fieldMatchers: [{ field: 'id_user', pattern: /deportista/i }],
  })

  return {
    ...controller,
    seasonName: season?.name,
    athleteOptions,
    isLoadingAthletes: assignmentsQuery.isPending,
  }
}
