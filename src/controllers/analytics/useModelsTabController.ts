import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import type { MlModel } from '@/types/ml'
import { parseApiError } from '@/utils/parseApiError'

export function useModelsTabController() {
  const { can } = useRole()
  const queryClient = useQueryClient()
  const [activating, setActivating] = useState<MlModel | null>(null)
  const [rejection, setRejection] = useState<{ id: number; message: string } | null>(null)

  const query = useQuery({ queryKey: queryKeys.ml.models(), queryFn: mlService.listModels })

  const mutation = useMutation({
    mutationFn: (model: MlModel) => mlService.activateModel(model.id_model),
    onSuccess: async (message) => {
      setActivating(null)
      setRejection(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ml.all })
      toast.success(message)
    },
    onError: (error, model) => {
      setActivating(null)
      setRejection({ id: model.id_model, message: parseApiError(error) })
    },
  })

  const models = [...(query.data ?? [])].sort(
    (first, second) =>
      Number(second.is_active) - Number(first.is_active) ||
      String(second.created_at ?? '').localeCompare(String(first.created_at ?? '')),
  )

  return {
    models,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canActivate: can('manageMlEngine'),
    activating,
    askActivate: setActivating,
    cancelActivate: () => setActivating(null),
    activate: () => activating && mutation.mutate(activating),
    isActivating: mutation.isPending,
    rejectionFor: (model: MlModel) =>
      rejection?.id === model.id_model ? rejection.message : undefined,
  }
}
