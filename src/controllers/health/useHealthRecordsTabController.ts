import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { HEALTH_RECORD_STATUS, type HealthRecordStatus } from '@/constants/enums'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { queryKeys } from '@/lib/queryKeys'
import { healthService, type HealthRecordFilters } from '@/services/healthService'
import type { HealthRecord } from '@/types/athlete'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10
const ALL = 'all'

export function useHealthRecordsTabController() {
  const dialogs = useCrudDialogs<HealthRecord>()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<HealthRecordStatus | typeof ALL>(ALL)

  const filters: HealthRecordFilters = {
    page,
    limit: PAGE_SIZE,
    status: status === ALL ? undefined : status,
  }

  const query = useQuery({
    queryKey: queryKeys.health.records(filters),
    queryFn: () => healthService.listHealthRecordsPage(filters),
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (record: HealthRecord) => healthService.removeHealthRecord(record.id_health),
    invalidate: [queryKeys.health.all, queryKeys.athlete.root],
    successMessage: (record) => `Registro de ${record.condition_type} eliminado.`,
    onSuccess: dialogs.close,
  })

  return {
    records: query.data?.items ?? [],
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    hasFilters: status !== ALL,
    status,
    setStatus: (value: string) => {
      setStatus(value as HealthRecordStatus | typeof ALL)
      setPage(1)
    },
    statusOptions: [
      { value: ALL, label: 'Todos los estados' },
      ...HEALTH_RECORD_STATUS.options.map(({ value, label }) => ({ value, label })),
    ],
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
