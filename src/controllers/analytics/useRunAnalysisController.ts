import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import type { RunNowResult } from '@/types/ml'
import { parseApiError } from '@/utils/parseApiError'

export function useRunAnalysisController() {
  const { can } = useRole()
  const queryClient = useQueryClient()
  const [result, setResult] = useState<RunNowResult | null>(null)

  const mutation = useMutation({
    mutationFn: mlService.runNow,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ml.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      ])
      setResult(data)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    canRun: can('runAnalysisNow'),
    run: () => mutation.mutate(),
    isRunning: mutation.isPending,
    result,
    close: () => setResult(null),
  }
}
