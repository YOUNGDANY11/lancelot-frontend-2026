import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { APP_MODULES } from '@/constants/navigation'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { toApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const MY_LOAD_DAYS = 42

export function useMyLoadController() {
  const { user } = useAuth()
  const idUser = user?.id_user ?? 0
  const to = toApiDate(new Date())
  const from = toApiDate(subDays(new Date(), MY_LOAD_DAYS - 1))

  const query = useQuery({
    queryKey: queryKeys.athlete.acwr(idUser, `${from}_${to}`),
    queryFn: () => loadMonitoringService.athleteSeries(idUser, from, to),
    enabled: idUser > 0,
  })

  return {
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    series: query.data?.series ?? [],
    thresholds: query.data?.thresholds,
    profileLoadPath: `${APP_MODULES.athletes.path}/${idUser}?tab=carga`,
  }
}
