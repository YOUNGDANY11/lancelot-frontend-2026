import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
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
import { usersService } from '@/services/usersService'
import { calculateAge } from '@/utils/age'
import { applyServerError, ROOT_SERVER_ERROR, serverErrorOf } from '@/utils/formErrors'
import { fullName } from '@/utils/text'

export function useAthleteAssignmentFormController({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const { activeSeason, categories } = useAppContext()
  const idSeason = activeSeason?.id_season

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

  const assignedIds = new Set((assignmentsQuery.data ?? []).map((assignment) => assignment.id_user))
  const athleteOptions: AthleteOption[] = (athletesQuery.data ?? [])
    .filter((athlete) => !assignedIds.has(athlete.id_user))
    .map((athlete) => {
      const age = calculateAge(athlete.birth_date)
      return {
        id: athlete.id_user,
        label: fullName(athlete),
        hint: age !== null ? `${age} años` : undefined,
      }
    })

  const mutation = useMutation({
    mutationFn: (values: AthleteAssignmentFormValues) => {
      if (idSeason === undefined) throw new Error('missing-season')
      return athleteAssignmentsService.create(toCreateAthleteAssignmentRequest(values, idSeason))
    },
    onSuccess: async (_response, values) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
      const athlete = athleteOptions.find((option) => option.id === values.id_user)
      toast.success(`${athlete?.label ?? 'El deportista'} quedó asignado a su categoría.`)
      form.reset({ id_user: 0, id_category: values.id_category, position: '' })
      onDone()
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing-season') {
        form.setError(ROOT_SERVER_ERROR, { message: 'Primero activa una temporada.' })
        return
      }
      applyServerError(form, error, [{ field: 'id_user', pattern: /deportista|usuario/i }])
    },
  })

  return {
    form,
    seasonName: activeSeason?.name,
    athleteOptions,
    isLoadingAthletes: athletesQuery.isPending || assignmentsQuery.isPending,
    categoryOptions: categories.map((category) => ({
      value: String(category.id_category),
      label: category.name,
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
