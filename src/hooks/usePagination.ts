import { useCallback, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 10

export function usePagination(pageSize = DEFAULT_PAGE_SIZE, scope = '') {
  const [state, setState] = useState({ scope, page: 1 })
  const page = state.scope === scope ? state.page : 1
  const setPage = useCallback((next: number) => setState({ scope, page: next }), [scope])
  const reset = useCallback(() => setState({ scope, page: 1 }), [scope])
  const afterRemoval = useCallback(
    (rowsOnPage: number) => {
      if (rowsOnPage <= 1 && page > 1) setState({ scope, page: page - 1 })
    },
    [scope, page],
  )
  return { page, limit: pageSize, setPage, reset, afterRemoval }
}
