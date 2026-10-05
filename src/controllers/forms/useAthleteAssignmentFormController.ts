import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { POSITION_GROUPS } from '@/constants/positions'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import {
  athleteAssignmentSchema,
  toCreateAthleteAssignmentRequest,
  type AthleteAssignmentFormValues,
} from '@/schemas/clubSchemas'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import type { Season } from '@/types/club'
import { usersService } from '@/services/usersService'
import {
  ELIGIBILITY_RULE,
  checkEligibility,
  referenceYearOf,
  sportingAge,
} from '@/utils/categoryEligibility'
import { applyServerError, ROOT_SERVER_ERROR, serverErrorOf } from '@/utils/formErrors'
import { fullName } from '@/utils/text'

export function useAthleteAssignmentFormController({
  onDone,
  season,
}: {
  onDone: () => void
  season?: Season | null
}) {
  const queryClient = useQueryClient()
  const { activeSeason, categories } = useAppContext()
  const targetSeason = season ?? activeSeason
  const idSeason = targetSeason?.id_season
  const referenceYear = referenceYearOf(targetSeason?.start_date)

  const form = useForm<AthleteAssignmentFormValues>({
    resolver: zodResolver(athleteAssignmentSchema),
    defaultValues: { id_user: 0, id_category: '', position: '' },
    mode: 'onTouched',
  })

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })

  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })

  const seasonAssignments = assignmentsQuery.data ?? []
  const assignmentsOf = (idUser: number) =>
    seasonAssignments.filter((assignment) => assignment.id_user === idUser)
  const athletes = athletesQuery.data ?? []

  const athleteOptions: AthleteOption[] = athletes.map((athlete) => {
    const age = sportingAge(athlete.birth_date, referenceYear)
    const current = assignmentsOf(athlete.id_user)
      .map((assignment) => assignment.category_name)
      .filter(Boolean)
    return {
      id: athlete.id_user,
      label: fullName(athlete),
      hint: [
        age !== null ? `${age} años en ${referenceYear}` : 'Sin fecha de nacimiento',
        current.length > 0 ? `en ${current.join(', ')}` : 'sin categoría',
      ].join(' · '),
    }
  })

  const selectedId = useWatch({ control: form.control, name: 'id_user' })
  const selectedAthlete = athletes.find((athlete) => athlete.id_user === selectedId)
  const selectedAssignments = selectedAthlete ? assignmentsOf(selectedAthlete.id_user) : []
  const takenCategories = new Set(selectedAssignments.map((assignment) => assignment.id_category))
  const selectedAge = selectedAthlete
    ? sportingAge(selectedAthlete.birth_date, referenceYear)
    : null

  const eligibleByAge = selectedAthlete
    ? categories.filter(
        (category) =>
          checkEligibility(selectedAthlete.birth_date, category, referenceYear).eligible,
      )
    : categories
  const eligible = eligibleByAge.filter((category) => !takenCategories.has(category.id_category))
  const ownGroup = [...eligibleByAge].sort(
    (first, second) => (first.max_age ?? Infinity) - (second.max_age ?? Infinity),
  )[0]

  const categoryHint = !selectedAthlete
    ? ELIGIBILITY_RULE
    : selectedAge === null
      ? 'Registra su fecha de nacimiento para poder asignarlo a una categoría.'
      : eligible.length === 0
        ? 'Ya está en todas las categorías que su edad le permite.'
        : `Tiene ${selectedAge} años en ${referenceYear}: puede jugar en su categoría y en las superiores.`

  const mutation = useMutation({
    mutationFn: (values: AthleteAssignmentFormValues) => {
      if (idSeason === undefined) throw new Error('missing-season')
      return athleteAssignmentsService.create(toCreateAthleteAssignmentRequest(values, idSeason))
    },
    onSuccess: async (_response, values) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
      const athlete = athleteOptions.find((option) => option.id === values.id_user)
      const category = categories.find((item) => item.id_category === Number(values.id_category))
      toast.success(
        `${athlete?.label ?? 'El deportista'} quedó en ${category?.name ?? 'la categoría'}.`,
      )
      form.reset({ id_user: 0, id_category: '', position: '' })
      onDone()
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing-season') {
        form.setError(ROOT_SERVER_ERROR, { message: 'Primero activa una temporada.' })
        return
      }
      applyServerError(form, error, [
        { field: 'id_category', pattern: /categor|límite|años|nacimiento/i },
        { field: 'id_user', pattern: /deportista|usuario/i },
      ])
    },
  })

  return {
    form,
    seasonName: targetSeason?.name,
    athleteOptions,
    isLoadingAthletes: athletesQuery.isPending || assignmentsQuery.isPending,
    onAthleteChange: (idUser: number) => {
      form.setValue('id_user', idUser, { shouldValidate: true })
      form.setValue('id_category', '')
      const existingPosition = assignmentsOf(idUser).find(
        (assignment) => assignment.position,
      )?.position
      if (existingPosition && !form.getValues('position'))
        form.setValue('position', existingPosition)
    },
    categoryHint,
    categoryOptions: eligible.map((category) => ({
      value: String(category.id_category),
      label:
        selectedAthlete && category.id_category === ownGroup?.id_category
          ? `${category.name} (su categoría)`
          : selectedAthlete
            ? `${category.name} (categoría superior)`
            : category.name,
    })),
    positionGroups: POSITION_GROUPS.map((group) => ({
      label: group.label,
      options: group.positions.map((position) => ({ value: position, label: position })),
    })),
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
