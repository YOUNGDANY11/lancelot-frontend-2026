import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { queryKeys } from '@/lib/queryKeys'
import { weightProfilesService } from '@/services/weightProfilesService'
import type { PositionWeightProfile } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'

const ALL = 'all'

export function useWeightProfilesTabController() {
  const { categories } = useAppContext()
  const dialogs = useCrudDialogs<PositionWeightProfile>()
  const [categoryFilter, setCategoryFilter] = useState(ALL)

  const query = useQuery({
    queryKey: queryKeys.weightProfiles.list(),
    queryFn: weightProfilesService.listAll,
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (profile: PositionWeightProfile) =>
      weightProfilesService.remove(profile.id_profile),
    invalidate: [queryKeys.weightProfiles.all],
    successMessage: (profile) =>
      `Perfil de ${profile.position} en ${profile.age_category} eliminado.`,
    onSuccess: dialogs.close,
  })

  const profiles = (query.data ?? [])
    .filter((profile) => categoryFilter === ALL || profile.age_category === categoryFilter)
    .sort(
      (first, second) =>
        first.age_category.localeCompare(second.age_category, 'es') ||
        first.position.localeCompare(second.position, 'es'),
    )

  return {
    profiles,
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
