import { useQuery } from '@tanstack/react-query'
import { APP_MODULES } from '@/constants/navigation'
import type { RiskLevelValue } from '@/constants/enums'
import { useOpenInboxItems } from '@/controllers/health/useOpenInboxItems'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { alertsService } from '@/services/alertsService'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { talentService } from '@/services/talentService'
import { trainingService } from '@/services/trainingService'
import { baseAssignmentByUser, buildRanking } from '@/utils/talentRanking'

const TOP_LIMIT = 5

export interface CategoryAlertCount {
  id_category: number | null
  name: string
  counts: Record<RiskLevelValue, number>
}

export function useDirectorHomeController() {
  const { season, categories } = useAppContext()
  const idSeason = season?.id_season
  const inbox = useOpenInboxItems()

  const assignmentsFilters = { id_season: idSeason, scope: 'all' }
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list(assignmentsFilters),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: idSeason !== undefined,
  })
  const sessionsFilters = { id_season: idSeason, page: 1, limit: 1 }
  const sessionsQuery = useQuery({
    queryKey: queryKeys.training.sessions(sessionsFilters),
    queryFn: () => trainingService.listSessions(sessionsFilters),
    enabled: idSeason !== undefined,
  })
  const alertsQuery = useQuery({
    queryKey: queryKeys.alerts.openCount(),
    queryFn: alertsService.countOpen,
  })
  const flagFilters = { id_season: idSeason, status: 'open' as const }
  const flagsQuery = useQuery({
    queryKey: queryKeys.talent.flagCount(flagFilters),
    queryFn: () => talentService.countFlags(flagFilters),
    enabled: idSeason !== undefined,
  })
  const indicesQuery = useQuery({
    queryKey: queryKeys.talent.indices(idSeason ?? 0),
    queryFn: () => talentService.listIndices(idSeason ?? 0),
    enabled: idSeason !== undefined,
  })

  const maxAgeById = new Map(
    categories.flatMap((item) =>
      item.max_age !== undefined ? [[item.id_category, item.max_age] as const] : [],
    ),
  )
  const baseByUser = baseAssignmentByUser(assignmentsQuery.data ?? [], maxAgeById)

  const byCategory = new Map<number | null, CategoryAlertCount>()
  for (const item of inbox.items) {
    const base = baseByUser.get(item.id_user)
    const key = base?.id_category ?? null
    const entry = byCategory.get(key) ?? {
      id_category: key,
      name: base?.category_name ?? 'Sin categoría',
      counts: { alto: 0, medio: 0, bajo: 0 },
    }
    entry.counts[item.level] += 1
    byCategory.set(key, entry)
  }
  const alertsByCategory = [...byCategory.values()].sort((first, second) => {
    const order = (entry: CategoryAlertCount) =>
      entry.id_category === null ? Infinity : (maxAgeById.get(entry.id_category) ?? Infinity)
    return order(first) - order(second)
  })

  const loading = (pending: boolean) => idSeason !== undefined && pending

  return {
    seasonName: season?.name,
    hasSeason: idSeason !== undefined,
    kpis: {
      athletes: baseByUser.size,
      sessions: sessionsQuery.data?.pagination.total ?? 0,
      openAlerts: alertsQuery.data?.total ?? 0,
      openFlags: flagsQuery.data ?? 0,
      isLoading:
        loading(assignmentsQuery.isPending) ||
        loading(sessionsQuery.isPending) ||
        alertsQuery.isPending ||
        loading(flagsQuery.isPending),
    },
    alertsByCategory,
    isLoadingAlerts: inbox.isLoading || loading(assignmentsQuery.isPending),
    topIndices: buildRanking(indicesQuery.data ?? [], baseByUser, null).slice(0, TOP_LIMIT),
    isLoadingIndices: loading(indicesQuery.isPending) || loading(assignmentsQuery.isPending),
    paths: {
      talent: APP_MODULES.talent.path,
      inbox: `${APP_MODULES.health.path}?tab=alertas`,
      flags: `${APP_MODULES.talent.path}?tab=senalizaciones`,
      training: APP_MODULES.training.path,
      athletes: APP_MODULES.athletes.path,
    },
    athletePath: (idUser: number) => `${APP_MODULES.athletes.path}/${idUser}`,
  }
}
