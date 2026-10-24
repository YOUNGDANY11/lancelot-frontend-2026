import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { SeasonStatus } from '@/constants/enums'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { seasonsService } from '@/services/seasonsService'
import type { Season } from '@/types/club'

export interface SeasonStatusChange {
  season: Season
  status: SeasonStatus
}

const PAGE_SIZE = 10

export function useSeasonsTabController() {
  const { page, setPage, afterRemoval } = usePagination(PAGE_SIZE)
  const filters = { page, limit: PAGE_SIZE }
  const query = useQuery({
    queryKey: queryKeys.seasons.page(filters),
    queryFn: () => seasonsService.list(filters),
    placeholderData: keepPreviousData,
  })
  const seasons = query.data?.items ?? []
  const { can } = useRole()
  const dialogs = useCrudDialogs<Season>()
  const [statusChange, setStatusChange] = useState<SeasonStatusChange | null>(null)

  const statusMutation = useResourceMutation({
    mutationFn: ({ season, status }: SeasonStatusChange) =>
      seasonsService.update(season.id_season, { status }),
    invalidate: [queryKeys.seasons.all],
    successMessage: ({ season, status }) =>
      status === 'closed'
        ? `Temporada ${season.name} cerrada. La detección de talento se está ejecutando.`
        : `La temporada ${season.name} quedó activa.`,
    onSuccess: () => setStatusChange(null),
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (season: Season) => seasonsService.remove(season.id_season),
    invalidate: [queryKeys.seasons.all],
    successMessage: (season) => `Temporada ${season.name} eliminada.`,
    onSuccess: () => {
      dialogs.close()
      afterRemoval(seasons.length)
    },
  })

  return {
    seasons,
    pagination: query.data?.pagination,
    setPage,
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    canManage: can('manageSeasons'),
    dialogs,
    statusChange,
    requestStatusChange: (season: Season, status: SeasonStatus) =>
      setStatusChange({ season, status }),
    cancelStatusChange: () => setStatusChange(null),
    confirmStatusChange: () => statusChange && statusMutation.mutate(statusChange),
    isChangingStatus: statusMutation.isPending,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
