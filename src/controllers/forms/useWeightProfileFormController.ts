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
import { applyServerError, serverErrorOf } from '@/utils/formErrors'

const EMPTY_PROFILE: WeightProfileFormValues = {
  position: '',
  age_category: '',
  w_physical: '40',
  w_technical: '40',
  w_participation: '20',
}

export function useWeightProfileFormController({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const { categories } = useAppContext()
  const form = useForm<WeightProfileFormValues>({
    resolver: zodResolver(weightProfileSchema),
    defaultValues: EMPTY_PROFILE,
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
      weightProfilesService.create(toCreateWeightProfileRequest(values)),
    onSuccess: async (_response, values) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.weightProfiles.all })
      toast.success(`Perfil de pesos creado para ${values.position} en ${values.age_category}.`)
      form.reset(EMPTY_PROFILE)
      onDone()
    },
    onError: (error) =>
      applyServerError(form, error, [{ field: 'position', pattern: /ya existe/i }]),
  })

  return {
    form,
    positionGroups: POSITION_GROUPS.map((group) => ({
      label: group.label,
      options: group.positions.map((position) => ({ value: position, label: position })),
    })),
    categoryOptions: categories.map((category) => ({ value: category.name, label: category.name })),
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
