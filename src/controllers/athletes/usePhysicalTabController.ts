import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { evaluationsService } from '@/services/evaluationsService'
import type { PhysicalEvaluation } from '@/types/athlete'
import { formatDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function usePhysicalTabController(idUser: number) {
  const { can } = useRole()
  const { season } = useAppContext()
  const dialogs = useCrudDialogs<PhysicalEvaluation>()
  const query = useQuery({
    queryKey: queryKeys.athlete.physical(idUser),
    queryFn: () => evaluationsService.listPhysical(idUser),
  })
  const { page, setPage, afterRemoval } = usePagination(PAGE_SIZE, String(idUser))
  const tableQuery = useQuery({
    queryKey: queryKeys.athlete.physicalPage(idUser, page),
    queryFn: () => evaluationsService.listPhysicalPage(idUser, { page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const tableRows = tableQuery.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (evaluation: PhysicalEvaluation) =>
      evaluationsService.removePhysical(evaluation.id_eval),
    invalidate: [queryKeys.athlete.physical(idUser), queryKeys.athlete.all(idUser)],
    successMessage: (evaluation) => `Evaluación del ${formatDate(evaluation.eval_date)} eliminada.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(tableRows.length)
    },
  })

  return {
    evaluations: query.data ?? [],
    tableRows,
    pagination: tableQuery.data?.pagination,
    setPage,
    isTableLoading: tableQuery.isPending,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageEvaluations'),
    canCreate: can('manageEvaluations') && season !== null,
    seasonName: season?.name,
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
