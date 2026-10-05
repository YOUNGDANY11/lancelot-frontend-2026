import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { SetupAction } from '@/constants/setupChecklist'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { usersService } from '@/services/usersService'
import { weightProfilesService } from '@/services/weightProfilesService'
import { parseApiError } from '@/utils/parseApiError'
import { buildSetupSteps, summarizeSetup } from '@/utils/setupChecklist'

export function useSetupChecklistController() {
  const { role, user } = useAuth()
  const context = useAppContext()
  const [openAction, setOpenAction] = useState<SetupAction | null>(null)
  const canSee = role === 'ADMIN' || role === 'DIRECTOR_TECNICO'
  const isAdmin = role === 'ADMIN'
  const idSeason = context.activeSeason?.id_season

  const weightProfilesQuery = useQuery({
    queryKey: [...queryKeys.weightProfiles.all, 'count'],
    queryFn: weightProfilesService.count,
    enabled: canSee,
  })
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: usersService.listAll,
    enabled: isAdmin,
  })
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
    enabled: canSee,
  })
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: canSee && idSeason !== undefined,
  })
  const consentsQuery = useQuery({
    queryKey: queryKeys.parentalConsents.list({ status: 'granted', scope: 'all' }),
    queryFn: () => parentalConsentsService.listAll({ status: 'granted' }),
    enabled: isAdmin,
  })

  const queries = [
    weightProfilesQuery,
    athletesQuery,
    ...(isAdmin ? [usersQuery, consentsQuery] : []),
    ...(idSeason !== undefined ? [assignmentsQuery] : []),
  ]
  const isLoading = context.isLoading || queries.some((query) => query.isPending)
  const failedQuery = queries.find((query) => query.isError)

  const steps = useMemo(() => {
    if (!canSee || !role || !user || isLoading) return []
    return buildSetupSteps({
      role,
      currentUserId: user.id_user,
      seasons: context.seasons,
      activeSeason: context.activeSeason,
      categories: context.categories,
      weightProfileCount: weightProfilesQuery.data ?? 0,
      users: isAdmin ? (usersQuery.data ?? []) : null,
      athletes: athletesQuery.data ?? [],
      assignments: idSeason !== undefined ? (assignmentsQuery.data ?? []) : [],
      grantedConsents: isAdmin ? (consentsQuery.data ?? []) : null,
    })
  }, [
    canSee,
    role,
    user,
    isLoading,
    isAdmin,
    idSeason,
    context.seasons,
    context.activeSeason,
    context.categories,
    weightProfilesQuery.data,
    usersQuery.data,
    athletesQuery.data,
    assignmentsQuery.data,
    consentsQuery.data,
  ])

  const summary = summarizeSetup(steps)

  return {
    canSee,
    isVisible: canSee && (isLoading || Boolean(failedQuery) || !summary.isComplete),
    isLoading,
    errorMessage: failedQuery ? parseApiError(failedQuery.error) : undefined,
    retry: () => queries.forEach((query) => void query.refetch()),
    steps,
    summary,
    openAction,
    open: (action: SetupAction) => setOpenAction(action),
    close: () => setOpenAction(null),
  }
}
