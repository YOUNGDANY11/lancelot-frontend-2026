import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { categoriesService } from '@/services/categoriesService'
import type { Category } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useCategoriesTabController() {
  const { can } = useRole()
  const dialogs = useCrudDialogs<Category>()
  const { page, setPage, afterRemoval } = usePagination(PAGE_SIZE)
  const filters = { page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.categories.page(filters),
    queryFn: () => categoriesService.list(filters),
    placeholderData: keepPreviousData,
  })
  const categories = query.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (category: Category) => categoriesService.remove(category.id_category),
    invalidate: [queryKeys.categories.all],
    successMessage: (category) => `Categoría ${category.name} eliminada.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(categories.length)
    },
  })

  return {
    categories,
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageClub'),
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
