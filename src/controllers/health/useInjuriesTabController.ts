import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  INJURY_MECHANISM,
  INJURY_SEVERITY,
  INJURY_STATUS,
  type InjuryMechanism,
  type InjuryStatus,
} from '@/constants/enums'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useDisclosure } from '@/hooks/useDisclosure'
import { queryKeys } from '@/lib/queryKeys'
import { healthService, type InjuryFilters } from '@/services/healthService'
import type { Injury } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10
const ALL = 'all'

export function useInjuriesTabController() {
  const dialogs = useCrudDialogs<Injury>()
  const missingSheet = useDisclosure()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<InjuryStatus | typeof ALL>(ALL)
  const [mechanism, setMechanism] = useState<InjuryMechanism | typeof ALL>(ALL)

  const filters: InjuryFilters = {
    page,
    limit: PAGE_SIZE,
    status: status === ALL ? undefined : status,
    mechanism: mechanism === ALL ? undefined : mechanism,
  }

  const query = useQuery({
    queryKey: queryKeys.health.injuries(filters),
    queryFn: () => healthService.listInjuriesPage(filters),
    placeholderData: keepPreviousData,
  })

  const totalsQuery = useQuery({
    queryKey: queryKeys.health.injuryMechanism(),
    queryFn: healthService.injuryMechanismTotals,
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (injury: Injury) => healthService.removeInjury(injury.id_injury),
    invalidate: [queryKeys.health.all, queryKeys.athlete.root],
    successMessage: (injury) => `Lesión del ${formatDate(injury.injury_date)} eliminada.`,
    onSuccess: dialogs.close,
  })

  return {
    injuries: query.data?.items ?? [],
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    hasFilters: status !== ALL || mechanism !== ALL,
    status,
    setStatus: (value: string) => {
      setStatus(value as InjuryStatus | typeof ALL)
      setPage(1)
    },
    statusOptions: [
      { value: ALL, label: 'Todos los estados' },
      ...INJURY_STATUS.options.map(({ value, label }) => ({ value, label })),
    ],
    mechanism,
    setMechanism: (value: string) => {
      setMechanism(value as InjuryMechanism | typeof ALL)
      setPage(1)
    },
    mechanismOptions: [
      { value: ALL, label: 'Cualquier mecanismo' },
      ...INJURY_MECHANISM.options.map(({ value, label }) => ({ value, label })),
    ],
    severityLabels: INJURY_SEVERITY.labels,
    missingMechanism: totalsQuery.data?.missing ?? 0,
    missingSheet,
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
