import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { categoriesService } from '@/services/categoriesService'
import { competitionService } from '@/services/competitionService'
import type { Competency } from '@/types/competition'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useCompetitionsTabController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const dialogs = useCrudDialogs<Competency>()
  const [callUpCompetency, setCallUpCompetency] = useState<Competency | null>(null)
  const idSeason = season?.id_season
  const idCategory = category?.id_category
  const { page, setPage, afterRemoval } = usePagination(
    PAGE_SIZE,
    `${idSeason ?? ''}:${idCategory ?? ''}`,
  )

  const filters = { id_season: idSeason, id_category: idCategory, page, limit: PAGE_SIZE }
  const competenciesQuery = useQuery({
    queryKey: queryKeys.competencies.page(filters),
    queryFn: () => competitionService.listCompetenciesPage(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesService.listAll,
  })

  const categoryNames = new Map(
    (categoriesQuery.data ?? []).map((item) => [item.id_category, item.name]),
  )
  const competencies = competenciesQuery.data?.items ?? []

  const deleteMutation = useResourceMutation({
    mutationFn: (competency: Competency) =>
      competitionService.removeCompetency(competency.id_competency),
    invalidate: [queryKeys.competencies.all],
    successMessage: (competency) => `Competencia ${competency.name} eliminada.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(competencies.length)
    },
  })

  return {
    season,
    hasSeason: idSeason !== undefined,
    categoryFilterName: category?.name,
    competencies,
    pagination: competenciesQuery.data?.pagination,
    setPage,
    categoryName: (idCategory: number) => categoryNames.get(idCategory) ?? '—',
    isLoading: idSeason !== undefined && competenciesQuery.isPending,
    errorMessage: competenciesQuery.isError ? parseApiError(competenciesQuery.error) : undefined,
    retry: () => void competenciesQuery.refetch(),
    canManage: can('manageClub'),
    dialogs,
    callUpCompetency,
    openCallUps: setCallUpCompetency,
    closeCallUps: () => setCallUpCompetency(null),
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
