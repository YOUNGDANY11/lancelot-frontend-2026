import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { InjuryMechanism } from '@/constants/enums'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'
import type { Injury } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

async function loadMissing(): Promise<Injury[]> {
  const injuries = await healthService.listAllInjuries()
  return injuries.filter((injury) => !injury.mechanism)
}

export function useMissingMechanismController(enabled: boolean) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.health.missingMechanism(),
    queryFn: loadMissing,
    enabled,
  })

  const mutation = useMutation({
    mutationFn: ({ injury, mechanism }: { injury: Injury; mechanism: InjuryMechanism }) =>
      healthService.updateInjury(injury.id_injury, { mechanism }),
    onSuccess: async (_data, { injury }) => {
      queryClient.setQueryData<Injury[]>(queryKeys.health.missingMechanism(), (current) =>
        current?.filter((candidate) => candidate.id_injury !== injury.id_injury),
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.health.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      ])
      toast.success(
        `Mecanismo guardado para ${injury.athlete_name || 'la lesión'} (${formatDate(injury.injury_date)}).`,
      )
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    injuries: query.data ?? [],
    isLoading: enabled && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    setMechanism: (injury: Injury, mechanism: InjuryMechanism) =>
      mutation.mutate({ injury, mechanism }),
    savingId: mutation.isPending ? mutation.variables?.injury.id_injury : undefined,
  }
}
