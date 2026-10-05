import { useQuery } from '@tanstack/react-query'
import { canAccessModule } from '@/constants/navigation'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { alertsService } from '@/services/alertsService'

const ALERTS_REFRESH_MS = 5 * 60_000

export function useNotificationsController() {
  const { role } = useRole()
  const canSeeAlerts = canAccessModule('health', role)

  const query = useQuery({
    queryKey: queryKeys.alerts.openCount(),
    queryFn: alertsService.countOpen,
    enabled: canSeeAlerts,
    staleTime: 60_000,
    refetchInterval: ALERTS_REFRESH_MS,
  })

  const total = query.data?.total ?? 0

  return {
    canSeeAlerts,
    isLoading: query.isPending,
    isError: query.isError,
    fatigue: query.data?.fatigue ?? 0,
    risk: query.data?.risk ?? 0,
    total,
    badgeLabel: total > 99 ? '99+' : String(total),
    triggerLabel:
      total === 0
        ? 'Alertas: no hay alertas pendientes'
        : `Alertas: ${total} ${total === 1 ? 'alerta pendiente' : 'alertas pendientes'}`,
  }
}
