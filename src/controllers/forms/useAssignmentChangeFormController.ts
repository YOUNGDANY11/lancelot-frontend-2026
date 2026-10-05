import { useQuery } from '@tanstack/react-query'
import { POSITION_GROUPS } from '@/constants/positions'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { assignmentChangeSchema, type AssignmentChangeFormValues } from '@/schemas/clubSchemas'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { usersService } from '@/services/usersService'
import type { AthleteAssignment } from '@/types/club'
import { checkEligibility, referenceYearOf, sportingAge } from '@/utils/categoryEligibility'
import { fullName } from '@/utils/text'

export function useAssignmentChangeFormController({
  assignment,
  onDone,
}: {
  assignment: AthleteAssignment
  onDone: () => void
}) {
  const { categories, seasons } = useAppContext()
  const assignmentSeason = seasons.find((item) => item.id_season === assignment.id_season)
  const referenceYear = referenceYearOf(assignmentSeason?.start_date)

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })
  const seasonFilters = { id_season: assignment.id_season ?? undefined, scope: 'all' }
  const seasonAssignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list(seasonFilters),
    queryFn: () =>
      athleteAssignmentsService.listAll({ id_season: assignment.id_season ?? undefined }),
  })

  const birthDate = (athletesQuery.data ?? []).find(
    (athlete) => athlete.id_user === assignment.id_user,
  )?.birth_date
  const otherCategories = new Set(
    (seasonAssignmentsQuery.data ?? [])
      .filter(
        (item) => item.id_user === assignment.id_user && item.id_ath_cat !== assignment.id_ath_cat,
      )
      .map((item) => item.id_category),
  )
  const age = sportingAge(birthDate, referenceYear)

  const controller = useEntityFormController<AssignmentChangeFormValues>({
    schema: assignmentChangeSchema,
    defaultValues: {
      id_category: assignment.id_category ? String(assignment.id_category) : '',
      position: assignment.position ?? '',
    },
    submit: (values) =>
      athleteAssignmentsService.update(assignment.id_ath_cat, {
        id_category: Number(values.id_category),
        position: values.position,
      }),
    invalidate: [queryKeys.assignments.all, queryKeys.athlete.all(assignment.id_user)],
    successMessage: (values) => {
      const target = categories.find((item) => item.id_category === Number(values.id_category))
      return `${fullName(assignment)} quedó en ${target?.name ?? 'la nueva categoría'}.`
    },
    onDone,
    fieldMatchers: [{ field: 'id_category', pattern: /categor|límite|años|nacimiento/i }],
  })

  const isLoadingAthlete = athletesQuery.isPending || seasonAssignmentsQuery.isPending
  const options = categories.filter(
    (item) =>
      item.id_category === assignment.id_category ||
      (!otherCategories.has(item.id_category) &&
        (isLoadingAthlete || checkEligibility(birthDate, item, referenceYear).eligible)),
  )

  return {
    ...controller,
    athleteName: fullName(assignment),
    currentCategory: assignment.category_name,
    categoryHint:
      age !== null
        ? `Tiene ${age} años en ${referenceYear}: solo aparecen su categoría y las superiores en las que aún no está.`
        : undefined,
    categoryOptions: options.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
    positionGroups: POSITION_GROUPS.map((group) => ({
      label: group.label,
      options: group.positions.map((position) => ({ value: position, label: position })),
    })),
  }
}
