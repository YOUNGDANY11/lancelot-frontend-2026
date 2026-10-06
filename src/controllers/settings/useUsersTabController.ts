import { useQuery } from '@tanstack/react-query'
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
import { fullName, matchesSearch } from '@/utils/text'

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

  const query = useQuery({ queryKey: queryKeys.users.list(), queryFn: usersService.listAll })

  const deleteMutation = useResourceMutation({
    mutationFn: (account: User) => usersService.remove(account.id_user),
    invalidate: [queryKeys.users.all],
    successMessage: (account) => `Cuenta de ${fullName(account)} eliminada.`,
    onSuccess: dialogs.close,
  })

  const filtered = (query.data ?? [])
    .map((account) => ({ account, role: resolveRoleCode(account.role_name, account.id_role) }))
    .filter(
      (entry) =>
        (role === ALL || entry.role === role) &&
        matchesSearch(`${fullName(entry.account)} ${entry.account.email}`, debouncedSearch),
    )
    .sort((first, second) =>
      `${first.account.lastname} ${first.account.name}`.localeCompare(
        `${second.account.lastname} ${second.account.name}`,
        'es',
      ),
    )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  return {
    rows: filtered
      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
      .map((entry) => entry.account),
    pagination: { page: currentPage, limit: PAGE_SIZE, total: filtered.length, totalPages },
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
    dialogs,
    createSheet,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
