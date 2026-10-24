import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ROLE_CODES, ROLE_LABELS, type RoleCode } from '@/constants/roles'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAuth } from '@/hooks/useAuth'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useDebounce } from '@/hooks/useDebounce'
import { useDisclosure } from '@/hooks/useDisclosure'
import { queryKeys } from '@/lib/queryKeys'
import { usersService } from '@/services/usersService'
import type { User } from '@/types/user'
import { parseApiError } from '@/utils/parseApiError'
import { resolveRoleCode } from '@/utils/role'
import { fullName } from '@/utils/text'

const PAGE_SIZE = 12
const ALL = 'all'

export function useUsersTabController() {
  const { user } = useAuth()
  const dialogs = useCrudDialogs<User>()
  const createSheet = useDisclosure()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleCode | typeof ALL>(ALL)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 250)

  const filters = {
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    role: role === ALL ? undefined : role,
  }
  const query = useQuery({
    queryKey: queryKeys.users.page(filters),
    queryFn: () => usersService.listUsers(filters),
    placeholderData: keepPreviousData,
  })
  const rows = query.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (account: User) => usersService.remove(account.id_user),
    invalidate: [queryKeys.users.all],
    successMessage: (account) => `Cuenta de ${fullName(account)} eliminada.`,
    onSuccess: () => {
      dialogs.close()
      if (rows.length === 1 && page > 1) setPage(page - 1)
    },
  })

  return {
    rows,
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    search,
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    role,
    setRole: (value: string) => {
      setRole(value as RoleCode | typeof ALL)
      setPage(1)
    },
    roleOptions: [
      { value: ALL, label: 'Todos los roles' },
      ...ROLE_CODES.map((code) => ({ value: code, label: ROLE_LABELS[code] })),
    ],
    roleLabel: (code: RoleCode | null) => (code ? ROLE_LABELS[code] : 'Sin rol reconocido'),
    isSelf: (account: User) => account.id_user === user?.id_user,
    deleteDescription: (account: User | null) =>
      account && resolveRoleCode(account.role_name, account.id_role) === 'DEPORTISTA'
        ? 'Se eliminarán de forma permanente su cuenta y todo su historial: asignaciones, cargas RPE, evaluaciones, objetivos, lesiones, registros de salud, alertas e índices. Esta acción no se puede deshacer.'
        : 'La persona ya no podrá ingresar. Las evaluaciones y registros que hizo sobre los deportistas se conservan, sin su nombre como autor.',
    dialogs,
    createSheet,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
