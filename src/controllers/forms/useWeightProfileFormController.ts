import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { POSITION_GROUPS } from '@/constants/positions'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import {
  toCreateWeightProfileRequest,
  weightProfileSchema,
  weightsTotal,
  type WeightProfileFormValues,
} from '@/schemas/settingsSchemas'
import { weightProfilesService } from '@/services/weightProfilesService'
import type { PositionWeightProfile } from '@/types/club'
import { applyServerError, serverErrorOf } from '@/utils/formErrors'

const EMPTY_PROFILE: WeightProfileFormValues = {
  position: '',
  age_category: '',
  w_physical: '40',
  w_technical: '40',
  w_participation: '20',
}

function toPercent(weight: number): string {
  return String(Math.round(weight * 100))
}

function defaultsFor(profile: PositionWeightProfile | null | undefined): WeightProfileFormValues {
  if (!profile) return EMPTY_PROFILE
  return {
    position: profile.position,
    age_category: profile.age_category,
    w_physical: toPercent(profile.w_physical),
    w_technical: toPercent(profile.w_technical),
    w_participation: toPercent(profile.w_participation),
  }
}

export function useWeightProfileFormController({
  onDone,
  profile,
}: {
  onDone: () => void
  profile?: PositionWeightProfile | null
}) {
  const queryClient = useQueryClient()
  const { categories } = useAppContext()
  const form = useForm<WeightProfileFormValues>({
    resolver: zodResolver(weightProfileSchema),
    defaultValues: defaultsFor(profile),
    mode: 'onTouched',
  })

  const [physical, technical, participation] = useWatch({
    control: form.control,
    name: ['w_physical', 'w_technical', 'w_participation'],
  })
  const total = weightsTotal({
    w_physical: physical,
    w_technical: technical,
    w_participation: participation,
  })

  const mutation = useMutation({
    mutationFn: (values: WeightProfileFormValues) =>
      profile
        ? weightProfilesService.update(profile.id_profile, toCreateWeightProfileRequest(values))
        : weightProfilesService.create(toCreateWeightProfileRequest(values)),
    onSuccess: async (_response, values) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.weightProfiles.all })
      toast.success(
        profile
          ? `Perfil de ${values.position} en ${values.age_category} actualizado.`
          : `Perfil de pesos creado para ${values.position} en ${values.age_category}.`,
      )
      form.reset(EMPTY_PROFILE)
      onDone()
    },
    onError: (error) =>
      applyServerError(form, error, [{ field: 'position', pattern: /ya existe/i }]),
  })

  const categoryNames = categories.map((category) => category.name)
  const extraCategory =
    profile && !categoryNames.includes(profile.age_category) ? [profile.age_category] : []

  return {
    form,
    isEditing: Boolean(profile),
    positionGroups: POSITION_GROUPS.map((group) => ({
      label: group.label,
      options: group.positions.map((position) => ({ value: position, label: position })),
    })),
    categoryOptions: [...categoryNames, ...extraCategory].map((name) => ({
      value: name,
      label: name,
    })),
    weights: {
      physical: Number(physical) || 0,
      technical: Number(technical) || 0,
      participation: Number(participation) || 0,
    },
    total,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
