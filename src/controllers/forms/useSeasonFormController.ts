import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryKeys'
import {
  activateSeasonSchema,
  seasonSchema,
  toCreateSeasonRequest,
  type ActivateSeasonFormValues,
  type SeasonFormValues,
} from '@/schemas/clubSchemas'
import { seasonsService } from '@/services/seasonsService'
import { useAppContext } from '@/hooks/useAppContext'
import { applyServerError, serverErrorOf } from '@/utils/formErrors'

interface FormControllerOptions {
  onDone: () => void
}

const EMPTY_SEASON: SeasonFormValues = {
  name: '',
  start_date: '',
  end_date: '',
  activateNow: true,
}

export function useSeasonFormController({ onDone }: FormControllerOptions) {
  const queryClient = useQueryClient()
  const { setSeasonId } = useAppContext()
  const form = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: EMPTY_SEASON,
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: (values: SeasonFormValues) => seasonsService.create(toCreateSeasonRequest(values)),
    onSuccess: async (season) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all })
      setSeasonId(season.id_season)
      toast.success(`Temporada ${season.name} creada.`)
      form.reset(EMPTY_SEASON)
      onDone()
    },
    onError: (error) => applyServerError(form, error, [{ field: 'end_date', pattern: /fecha/i }]),
  })

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}

export function useActivateSeasonController({ onDone }: FormControllerOptions) {
  const queryClient = useQueryClient()
  const { seasons, setSeasonId } = useAppContext()
  const form = useForm<ActivateSeasonFormValues>({
    resolver: zodResolver(activateSeasonSchema),
    defaultValues: { id_season: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: ActivateSeasonFormValues) =>
      seasonsService.update(Number(values.id_season), { status: 'active' }),
    onSuccess: async (season) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.seasons.all })
      setSeasonId(season.id_season)
      toast.success(`La temporada ${season.name} quedó activa.`)
      onDone()
    },
    onError: (error) => applyServerError(form, error),
  })

  return {
    form,
    options: seasons
      .filter((season) => season.status === 'planned')
      .map((season) => ({ value: String(season.id_season), label: season.name })),
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
