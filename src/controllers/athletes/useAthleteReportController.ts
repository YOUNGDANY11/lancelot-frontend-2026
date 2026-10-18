import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { APP_MODULES } from '@/constants/navigation'
import {
  REPORT_STAGE_ORDER,
  REPORT_STAGES,
  reportStageForAge,
  type ReportStage,
} from '@/constants/reportStages'
import { parseAthleteId } from '@/controllers/athletes/useAthleteProfileController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { evaluationsService } from '@/services/evaluationsService'
import { objectivesService } from '@/services/objectivesService'
import { reportsService } from '@/services/reportsService'
import { averageByIndicator, countLevels, inSeason } from '@/utils/athleteReport'
import { formatDate, todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

export function useAthleteReportController(rawId: string | undefined) {
  const { season } = useAppContext()
  const idUser = parseAthleteId(rawId)
  const idSeason = season?.id_season
  const ready = idUser !== null && idSeason !== undefined
  const id = idUser ?? 0
  const [stageChoice, setStageChoice] = useState<ReportStage | 'auto'>('auto')

  const summaryQuery = useQuery({
    queryKey: queryKeys.athlete.summary(id, idSeason ?? 0),
    queryFn: () => reportsService.seasonSummary(id, idSeason ?? 0),
    enabled: ready,
  })
  const comparisonQuery = useQuery({
    queryKey: queryKeys.athlete.comparison(id),
    queryFn: () => reportsService.seasonComparison(id),
    enabled: idUser !== null,
  })
  const physicalQuery = useQuery({
    queryKey: queryKeys.athlete.physical(id),
    queryFn: () => evaluationsService.listPhysical(id),
    enabled: idUser !== null,
  })
  const technicalQuery = useQuery({
    queryKey: queryKeys.athlete.technical(id),
    queryFn: () => evaluationsService.listTechnical(id),
    enabled: idUser !== null,
  })
  const objectivesQuery = useQuery({
    queryKey: queryKeys.athlete.objectives(id),
    queryFn: () => objectivesService.list(id),
    enabled: idUser !== null,
  })

  const queries = [summaryQuery, comparisonQuery, physicalQuery, technicalQuery, objectivesQuery]
  const failed = queries.find((query) => query.isError)
  const summary = summaryQuery.data
  const autoStage = reportStageForAge(summary?.athlete.sporting_age)
  const stage = REPORT_STAGES[stageChoice === 'auto' ? autoStage : stageChoice]

  return {
    idUser,
    hasSeason: idSeason !== undefined,
    seasonName: season?.name ?? '',
    isLoading: ready && queries.some((query) => query.isPending),
    errorMessage: failed ? parseApiError(failed.error) : undefined,
    retry: () => queries.forEach((query) => void query.refetch()),
    generatedOn: formatDate(todayApiDate()),
    summary,
    comparison: comparisonQuery.data ?? [],
    physical: inSeason(physicalQuery.data ?? [], idSeason ?? 0),
    technical: averageByIndicator(inSeason(technicalQuery.data ?? [], idSeason ?? 0)),
    objectives: inSeason(objectivesQuery.data ?? [], idSeason ?? 0),
    alerts: {
      fatigue: countLevels((summary?.fatigue_alerts ?? []).map((alert) => alert.level)),
      risk: countLevels(
        (summary?.injury_risk_assessments ?? []).map((assessment) => assessment.risk_level),
      ),
    },
    profilePath: `${APP_MODULES.athletes.path}/${id}`,
    stage,
    stageValue: stageChoice,
    stageOptions: [
      {
        value: 'auto',
        label: `Según su edad (${REPORT_STAGES[autoStage].label.toLowerCase()})`,
      },
      ...REPORT_STAGE_ORDER.map((value) => ({
        value,
        label: `${REPORT_STAGES[value].label}, ${REPORT_STAGES[value].ages}`,
      })),
    ],
    onStageChange: (value: string) => setStageChoice(value as ReportStage | 'auto'),
    print: () => window.print(),
  }
}
