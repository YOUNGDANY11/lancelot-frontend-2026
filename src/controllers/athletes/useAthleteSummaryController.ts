import { useQuery } from '@tanstack/react-query'
import { APP_MODULES, canAccessModule } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { reportsService } from '@/services/reportsService'
import { parseApiError } from '@/utils/parseApiError'

const LEVEL_ORDER = { alto: 0, medio: 1, bajo: 2 } as const

export function useAthleteSummaryController(idUser: number) {
  const { season } = useAppContext()
  const { role } = useRole()
  const idSeason = season?.id_season

  const query = useQuery({
    queryKey: queryKeys.athlete.summary(idUser, idSeason ?? 0),
    queryFn: () => reportsService.seasonSummary(idUser, idSeason ?? 0),
    enabled: idSeason !== undefined,
  })

  const summary = query.data
  const openAlerts = [
    ...(summary?.fatigue_alerts ?? [])
      .filter((alert) => alert.status === 'open')
      .map((alert) => ({
        key: `fatiga-${alert.id_alert}`,
        kind: 'Alerta de fatiga',
        date: alert.date,
        level: alert.level,
        acwr: alert.acwr_value,
      })),
    ...(summary?.injury_risk_assessments ?? [])
      .filter((assessment) => assessment.status === 'open')
      .map((assessment) => ({
        key: `riesgo-${assessment.id_assessment}`,
        kind: 'Evaluación de riesgo',
        date: assessment.assessment_date,
        level: assessment.risk_level,
        acwr: assessment.acwr_value ?? null,
      })),
  ].sort(
    (first, second) =>
      LEVEL_ORDER[first.level] - LEVEL_ORDER[second.level] || second.date.localeCompare(first.date),
  )

  return {
    seasonName: season?.name,
    hasSeason: idSeason !== undefined,
    isLoading: idSeason !== undefined && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    summary,
    openAlerts,
    healthInboxPath: canAccessModule('health', role)
      ? `${APP_MODULES.health.path}?tab=alertas`
      : null,
  }
}
