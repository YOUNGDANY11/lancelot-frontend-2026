import { useQuery } from '@tanstack/react-query'
import { endOfWeek, startOfWeek } from 'date-fns'
import { useState } from 'react'
import { APP_MODULES } from '@/constants/navigation'
import { LEVEL_PRIORITY } from '@/constants/health'
import { useOpenInboxItems } from '@/controllers/health/useOpenInboxItems'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { competitionService } from '@/services/competitionService'
import { trainingService } from '@/services/trainingService'
import type { InboxItem } from '@/types/health'
import type { TrainingSession } from '@/types/training'
import { toApiDate, todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

const TEAM_LIMIT = 5

export function useCoachHomeController() {
  const { season, category, categories } = useAppContext()
  const [rpeSession, setRpeSession] = useState<TrainingSession | null>(null)
  const inbox = useOpenInboxItems()
  const idSeason = season?.id_season
  const target = category ?? categories[0] ?? null
  const idCategory = target?.id_category
  const today = todayApiDate()
  const weekStart = toApiDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekEnd = toApiDate(endOfWeek(new Date(), { weekStartsOn: 1 }))

  const sessionFilters = { id_season: idSeason, id_category: idCategory, scope: 'all' }
  const sessionsQuery = useQuery({
    queryKey: queryKeys.training.sessions(sessionFilters),
    queryFn: () =>
      trainingService.listAllSessions({ id_season: idSeason, id_category: idCategory }),
    enabled: idSeason !== undefined && idCategory !== undefined,
  })
  const teamQuery = useQuery({
    queryKey: queryKeys.training.teamAcwr(idCategory ?? 0, today),
    queryFn: () => trainingService.categoryAcwr(idCategory ?? 0, today),
    enabled: idCategory !== undefined,
  })
  const matchFilters = { id_category: idCategory, scope: 'all' }
  const matchesQuery = useQuery({
    queryKey: queryKeys.matches.list(matchFilters),
    queryFn: () => competitionService.listAllMatches({ id_category: idCategory }),
    enabled: idCategory !== undefined,
  })

  const weekSessions = (sessionsQuery.data ?? [])
    .filter((session) => session.date >= weekStart && session.date <= weekEnd)
    .sort((first, second) => first.date.localeCompare(second.date))
  const team = teamQuery.data?.athletes ?? []
  const nextMatch = (matchesQuery.data ?? [])
    .filter((match) => String(match.date).slice(0, 10) >= today)
    .sort((first, second) =>
      `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`),
    )[0]

  const rosterIds = new Set(team.map((athlete) => athlete.id_user))
  const worstByUser = new Map<number, InboxItem>()
  for (const item of inbox.items) {
    if (!rosterIds.has(item.id_user)) continue
    const current = worstByUser.get(item.id_user)
    if (!current || LEVEL_PRIORITY[item.level] < LEVEL_PRIORITY[current.level])
      worstByUser.set(item.id_user, item)
  }

  return {
    categoryName: target?.name,
    hasCategory: idCategory !== undefined,
    hasSeason: idSeason !== undefined,
    sessions: {
      items: weekSessions,
      isLoading: idSeason !== undefined && idCategory !== undefined && sessionsQuery.isPending,
      errorMessage: sessionsQuery.isError ? parseApiError(sessionsQuery.error) : undefined,
      retry: () => void sessionsQuery.refetch(),
      isToday: (session: TrainingSession) => session.date === today,
    },
    rpeSession,
    openRpeLog: setRpeSession,
    closeRpeLog: () => setRpeSession(null),
    team: {
      items: team.slice(0, TEAM_LIMIT),
      total: team.length,
      thresholds: teamQuery.data?.thresholds,
      isLoading: idCategory !== undefined && teamQuery.isPending,
      errorMessage: teamQuery.isError ? parseApiError(teamQuery.error) : undefined,
      retry: () => void teamQuery.refetch(),
    },
    nextMatch,
    isLoadingMatch: idCategory !== undefined && matchesQuery.isPending,
    alerted: [...worstByUser.values()].sort(
      (first, second) => LEVEL_PRIORITY[first.level] - LEVEL_PRIORITY[second.level],
    ),
    isLoadingAlerts: inbox.isLoading,
    paths: {
      training: APP_MODULES.training.path,
      teamLoad: `${APP_MODULES.training.path}?tab=carga`,
      matches: `${APP_MODULES.club.path}?tab=partidos`,
      inbox: `${APP_MODULES.health.path}?tab=alertas`,
    },
    athletePath: (idUser: number) => `${APP_MODULES.athletes.path}/${idUser}?tab=carga`,
  }
}
