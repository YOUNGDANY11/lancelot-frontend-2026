import { useState } from 'react'
import type { SeasonStatus } from '@/constants/enums'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { seasonsService } from '@/services/seasonsService'
import type { Season } from '@/types/club'

export interface SeasonStatusChange {
  season: Season
  status: SeasonStatus
}

export function useSeasonsTabController() {
  const { seasons, isLoading, isError, retry } = useAppContext()
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
    onSuccess: dialogs.close,
  })

  return {
    seasons,
    isLoading,
    isError,
    retry,
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
