import { useCallback, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 10

export function usePagination(pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const reset = useCallback(() => setPage(1), [])
  return { page, limit: pageSize, setPage, reset }
}
