import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'

export function useOpenInboxItems() {
  const query = useQuery({
    queryKey: queryKeys.alerts.openItems(),
    queryFn: healthService.listOpenInbox,
  })
  return { items: query.data ?? [], isLoading: query.isPending }
}
