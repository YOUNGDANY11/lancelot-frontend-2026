import { useQuery } from '@tanstack/react-query'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { categoriesService } from '@/services/categoriesService'
import type { Category } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'

export function useCategoriesTabController() {
  const { can } = useRole()
  const dialogs = useCrudDialogs<Category>()
  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesService.listAll,
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (category: Category) => categoriesService.remove(category.id_category),
    invalidate: [queryKeys.categories.all],
    successMessage: (category) => `Categoría ${category.name} eliminada.`,
    onSuccess: dialogs.close,
  })

  return {
    categories: [...(query.data ?? [])].sort((first, second) => first.min_age - second.min_age),
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageClub'),
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
