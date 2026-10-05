import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { queryKeys } from '@/lib/queryKeys'
import { healthService, type HealthAuditFilters } from '@/services/healthService'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 20

export function useHealthAuditController() {
  const [page, setPage] = useState(1)
  const [recordId, setRecordId] = useState('')
  const debouncedRecordId = useDebounce(recordId, 400)
  const parsedRecordId = /^\d+$/.test(debouncedRecordId) ? Number(debouncedRecordId) : undefined

  const filters: HealthAuditFilters = { page, limit: PAGE_SIZE, id_health: parsedRecordId }

  const query = useQuery({
    queryKey: queryKeys.health.audit(filters),
    queryFn: () => healthService.listAuditLogs(filters),
    placeholderData: keepPreviousData,
  })

  return {
    logs: query.data?.items ?? [],
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    recordId,
    recordIdInvalid: recordId !== '' && !/^\d+$/.test(recordId),
    setRecordId: (value: string) => {
      setRecordId(value.trim())
      setPage(1)
    },
    hasFilters: parsedRecordId !== undefined,
  }
}
