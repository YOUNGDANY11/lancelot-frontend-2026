import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ViewMode } from '@/components/common/ViewModeToggle'
import type { MlModelTask } from '@/constants/enums'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import type { MlModel } from '@/types/ml'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export type ModelAction = 'activate' | 'deactivate' | 'delete'

const ACTIONS: Record<ModelAction, (id: number) => Promise<string>> = {
  activate: mlService.activateModel,
  deactivate: mlService.deactivateModel,
  delete: mlService.deleteModel,
}

export function useModelsTabController() {
  const { can } = useRole()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [confirming, setConfirming] = useState<{ action: ModelAction; model: MlModel } | null>(null)
  const [rejection, setRejection] = useState<{
    id: number
    version: string
    message: string
  } | null>(null)

  const filters = { page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.ml.models(filters),
    queryFn: () => mlService.listModels(filters),
    placeholderData: keepPreviousData,
  })

  const mutation = useMutation({
    mutationFn: ({ action, model }: { action: ModelAction; model: MlModel }) =>
      ACTIONS[action](model.id_model),
    onSuccess: async (message, { action }) => {
      setConfirming(null)
      setRejection(null)
      if (action === 'delete' && query.data?.items.length === 1 && page > 1) setPage(page - 1)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ml.all })
      toast.success(message)
    },
    onError: (error, { model }) => {
      setConfirming(null)
      setRejection({
        id: model.id_model,
        version: model.version,
        message: parseApiError(error),
      })
    },
  })

  const training = useMutation({
    mutationFn: (task: MlModelTask) => mlService.trainModel(task),
    onSuccess: async (result) => {
      setPage(1)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ml.all })
      toast.success(result.mensaje)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    models: query.data?.items ?? [],
    pagination: query.data?.pagination,
    setPage,
    viewMode,
    setViewMode,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageMlEngine'),
    train: (task: MlModelTask) => training.mutate(task),
    trainingTask: training.isPending ? training.variables : null,
    confirming,
    ask: (action: ModelAction, model: MlModel) => setConfirming({ action, model }),
    cancel: () => setConfirming(null),
    confirm: () => confirming && mutation.mutate(confirming),
    isPending: mutation.isPending,
    rejection,
    rejectionFor: (model: MlModel) =>
      rejection?.id === model.id_model ? rejection.message : undefined,
  }
}
