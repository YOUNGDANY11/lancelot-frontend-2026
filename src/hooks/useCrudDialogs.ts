import { useCallback, useState } from 'react'

type CrudDialogState<T> =
  { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: T } | { mode: 'delete'; item: T }

export function useCrudDialogs<T>() {
  const [state, setState] = useState<CrudDialogState<T>>({ mode: 'closed' })

  const close = useCallback(() => setState({ mode: 'closed' }), [])
  const openCreate = useCallback(() => setState({ mode: 'create' }), [])
  const openEdit = useCallback((item: T) => setState({ mode: 'edit', item }), [])
  const openDelete = useCallback((item: T) => setState({ mode: 'delete', item }), [])

  return {
    isCreateOpen: state.mode === 'create',
    editing: state.mode === 'edit' ? state.item : null,
    deleting: state.mode === 'delete' ? state.item : null,
    openCreate,
    openEdit,
    openDelete,
    close,
  }
}
