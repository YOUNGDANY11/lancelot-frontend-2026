import { useQuery } from '@tanstack/react-query'
import { APP_MODULES } from '@/constants/navigation'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { isMinor } from '@/utils/age'
import { parseApiError } from '@/utils/parseApiError'

export function useAthleteHealthController(idUser: number, birthDate: string | null) {
  const { can } = useRole()
  const canSeeInjuries = can('viewInjuries')
  const canSeeRecords = can('viewHealthRecords')
  const canSeeConsents = can('viewConsents')

  const injuriesQuery = useQuery({
    queryKey: queryKeys.athlete.injuries(idUser),
    queryFn: () => healthService.listInjuries(idUser),
    enabled: canSeeInjuries,
  })
  const recordsQuery = useQuery({
    queryKey: queryKeys.athlete.healthRecords(idUser),
    queryFn: () => healthService.listHealthRecords(idUser),
    enabled: canSeeRecords,
  })
  const consentsQuery = useQuery({
    queryKey: queryKeys.athlete.consents(idUser),
    queryFn: () => parentalConsentsService.listAll({ id_user: idUser }),
    enabled: canSeeConsents,
  })

  const injuries = [...(injuriesQuery.data ?? [])].sort((first, second) =>
    second.injury_date.localeCompare(first.injury_date),
  )
  const consents = consentsQuery.data ?? []

  return {
    healthModulePath: APP_MODULES.health.path,
    injuries: {
      visible: canSeeInjuries,
      items: injuries,
      missingMechanism: injuries.filter((injury) => !injury.mechanism).length,
      isLoading: injuriesQuery.isPending,
      errorMessage: injuriesQuery.isError ? parseApiError(injuriesQuery.error) : undefined,
      retry: () => void injuriesQuery.refetch(),
    },
    records: {
      visible: canSeeRecords,
      items: recordsQuery.data ?? [],
      isLoading: recordsQuery.isPending,
      errorMessage: recordsQuery.isError ? parseApiError(recordsQuery.error) : undefined,
      retry: () => void recordsQuery.refetch(),
    },
    consents: {
      visible: canSeeConsents,
      isMinor: isMinor(birthDate),
      hasGranted: consents.some((consent) => consent.status === 'granted'),
      latest: [...consents].sort((first, second) =>
        second.signed_at.localeCompare(first.signed_at),
      )[0],
      isLoading: consentsQuery.isPending,
      errorMessage: consentsQuery.isError ? parseApiError(consentsQuery.error) : undefined,
      retry: () => void consentsQuery.refetch(),
    },
  }
}
