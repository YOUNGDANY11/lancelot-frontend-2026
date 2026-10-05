import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { endOfWeek, startOfWeek } from 'date-fns'
import { useState } from 'react'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useCrudDialogs } from '@/hooks/useCrudDialogs'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { trainingService } from '@/services/trainingService'
import type { TrainingSession } from '@/types/training'
import { formatDate, toApiDate, todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10

export function useSessionsTabController() {
  const { season, category } = useAppContext()
  const { can } = useRole()
  const dialogs = useCrudDialogs<TrainingSession>()
  const [page, setPage] = useState(1)
  const [rpeSession, setRpeSession] = useState<TrainingSession | null>(null)
  const idSeason = season?.id_season
  const filters = {
    id_season: idSeason,
    id_category: category?.id_category,
    page,
    limit: PAGE_SIZE,
  }

  const query = useQuery({
    queryKey: queryKeys.training.sessions(filters),
    queryFn: () => trainingService.listSessions(filters),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (session: TrainingSession) => trainingService.removeSession(session.id_session),
    invalidate: [queryKeys.training.all],
    successMessage: (session) => `Sesión del ${formatDate(session.date)} eliminada.`,
    onSuccess: dialogs.close,
  })

  const today = new Date()
  const weekStart = toApiDate(startOfWeek(today, { weekStartsOn: 1 }))
  const weekEnd = toApiDate(endOfWeek(today, { weekStartsOn: 1 }))

  return {
    season,
    hasSeason: idSeason !== undefined,
    categoryName: category?.name,
    sessions: query.data?.items ?? [],
    pagination: query.data?.pagination,
    setPage,
    isLoading: idSeason !== undefined && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    canManage: can('manageClub'),
    dialogs,
    rpeSession,
    openRpeLog: setRpeSession,
    closeRpeLog: () => setRpeSession(null),
    isToday: (session: TrainingSession) => session.date === todayApiDate(),
    isThisWeek: (session: TrainingSession) => session.date >= weekStart && session.date <= weekEnd,
    confirmDelete: () => dialogs.deleting && deleteMutation.mutate(dialogs.deleting),
    isDeleting: deleteMutation.isPending,
  }
}
