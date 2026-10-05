import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'
import { parseApiError } from '@/utils/parseApiError'

interface ResourceMutationOptions<TVariables> {
  mutationFn: (variables: TVariables) => Promise<unknown>
  invalidate: QueryKey[]
  successMessage: (variables: TVariables) => string
  onSuccess?: (variables: TVariables) => void
}

export function useResourceMutation<TVariables>({
  mutationFn,
  invalidate,
  successMessage,
  onSuccess,
}: ResourceMutationOptions<TVariables>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: async (_data, variables) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
      toast.success(successMessage(variables))
      onSuccess?.(variables)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })
}
