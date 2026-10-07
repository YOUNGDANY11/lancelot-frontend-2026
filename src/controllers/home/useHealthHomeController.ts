import { useQuery } from '@tanstack/react-query'
import { APP_MODULES } from '@/constants/navigation'
import { useAlertInboxController } from '@/controllers/health/useAlertInboxController'
import { useMinorsWithoutConsent } from '@/controllers/health/useMinorsWithoutConsent'
import { useDisclosure } from '@/hooks/useDisclosure'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'
import type { Injury } from '@/types/athlete'
import { parseApiError } from '@/utils/parseApiError'

const HOME_LIMIT = 5

async function loadOngoingInjuries(): Promise<Injury[]> {
  const [active, recovering] = await Promise.all([
    healthService.listAllInjuries({ status: 'active' }),
    healthService.listAllInjuries({ status: 'recovering' }),
  ])
  return [...active, ...recovering].sort((first, second) =>
    second.injury_date.localeCompare(first.injury_date),
  )
}

export function useHealthHomeController() {
  const inbox = useAlertInboxController({ pageSize: HOME_LIMIT })
  const minors = useMinorsWithoutConsent()
  const missingSheet = useDisclosure()

  const injuriesQuery = useQuery({
    queryKey: [...queryKeys.health.all, 'ongoing-injuries'],
    queryFn: loadOngoingInjuries,
  })
  const totalsQuery = useQuery({
    queryKey: queryKeys.health.injuryMechanism(),
    queryFn: healthService.injuryMechanismTotals,
  })

  const healthPath = APP_MODULES.health.path

  return {
    inbox,
    injuries: {
      items: (injuriesQuery.data ?? []).slice(0, HOME_LIMIT),
      total: injuriesQuery.data?.length ?? 0,
      isLoading: injuriesQuery.isPending,
      errorMessage: injuriesQuery.isError ? parseApiError(injuriesQuery.error) : undefined,
      retry: () => void injuriesQuery.refetch(),
    },
    missingMechanism: totalsQuery.data?.missing ?? 0,
    isLoadingMechanism: totalsQuery.isPending,
    missingSheet,
    minors: { ...minors, items: minors.items.slice(0, HOME_LIMIT), total: minors.items.length },
    paths: {
      inbox: `${healthPath}?tab=alertas`,
      injuries: `${healthPath}?tab=lesiones`,
      consents: `${healthPath}?tab=consentimientos`,
    },
    athletePath: (idUser: number, tab = 'salud') =>
      `${APP_MODULES.athletes.path}/${idUser}?tab=${tab}`,
  }
}
