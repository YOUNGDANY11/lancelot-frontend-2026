import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { queryKeys } from '@/lib/queryKeys'
import { weightProfilesService } from '@/services/weightProfilesService'
import type { PositionWeightProfile } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'

const ALL = 'all'
const PAGE_SIZE = 10

export function useWeightProfilesTabController() {
  const { categories } = useAppContext()
  const dialogs = useCrudDialogs<PositionWeightProfile>()
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const { page, setPage, afterRemoval } = usePagination(PAGE_SIZE, categoryFilter)

  const filters = {
    page,
    limit: PAGE_SIZE,
    age_category: categoryFilter === ALL ? undefined : categoryFilter,
  }
  const query = useQuery({
    queryKey: queryKeys.weightProfiles.page(filters),
    queryFn: () => weightProfilesService.list(filters),
    placeholderData: keepPreviousData,
  })
  const profiles = query.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (profile: PositionWeightProfile) =>
      weightProfilesService.remove(profile.id_profile),
    invalidate: [queryKeys.weightProfiles.all],
    successMessage: (profile) =>
      `Perfil de ${profile.position} en ${profile.age_category} eliminado.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(profiles.length)
    },
  })

  return {
    profiles,
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    categoryFilter,
    setCategoryFilter,
    categoryOptions: [
      { value: ALL, label: 'Todas las categorías' },
      ...categories.map((item) => ({ value: item.name, label: item.name })),
    ],
    dialogs,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
