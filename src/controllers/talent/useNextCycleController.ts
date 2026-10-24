import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { SEASON_STATUS } from '@/constants/enums'
import { useAppContext } from '@/hooks/useAppContext'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { talentService } from '@/services/talentService'
import type { ApplyPlanSummary, FailedAthlete, PlannedAthlete } from '@/types/talent'
import { parseApiError } from '@/utils/parseApiError'
import {
  buildApplyPayload,
  countApplicable,
  resolveDecision,
  type PlanDecision,
  type PlanOverride,
} from '@/utils/nextCyclePlan'

const PAGE_SIZE = 15

interface DecisionState {
  key: string
  values: Record<number, PlanOverride>
}

export function useNextCycleController() {
  const { season, seasons, categories } = useAppContext()
  const { can } = useRole()
  const queryClient = useQueryClient()
  const idSeason = season?.id_season
  const [targetId, setTargetId] = useState<number | null>(null)
  const [decisions, setDecisions] = useState<DecisionState>({ key: '', values: {} })
  const [confirming, setConfirming] = useState(false)
  const [summary, setSummary] = useState<ApplyPlanSummary | null>(null)
  const stateKey = `${idSeason ?? 0}:${targetId ?? 'auto'}`
  const overrides = decisions.key === stateKey ? decisions.values : {}
  const { page, setPage } = usePagination(PAGE_SIZE, stateKey)

  const planQuery = useQuery({
    queryKey: queryKeys.talent.plan(idSeason ?? 0, targetId, page),
    queryFn: () =>
      talentService.getNextCyclePlan(idSeason ?? 0, targetId, { page, limit: PAGE_SIZE }),
    enabled: idSeason !== undefined,
    placeholderData: keepPreviousData,
  })
  const plan = planQuery.data
  const target = plan?.target ?? null
  const canPlan = can('planNextCycle')
  const canApply = canPlan && target !== null && target.status !== 'closed'

  const rows = (plan?.athletes ?? []).map((athlete) => ({
    athlete,
    decision: resolveDecision(athlete, overrides[athlete.id_user]?.patch),
  }))
  const overrideList = Object.values(overrides)
  const applicableCount = countApplicable(plan?.default_applicable ?? 0, overrideList)
  const categoryName = (idCategory: number) =>
    categories.find((item) => item.id_category === idCategory)?.name ?? `Categoría ${idCategory}`

  const update = (idUser: number, patch: Partial<PlanDecision>) => {
    const athlete = plan?.athletes.find((item) => item.id_user === idUser)
    if (!athlete) return
    setDecisions((previous) => {
      const values = previous.key === stateKey ? previous.values : {}
      return {
        key: stateKey,
        values: {
          ...values,
          [idUser]: { athlete, patch: { ...values[idUser]?.patch, ...patch } },
        },
      }
    })
  }

  const applyMutation = useMutation({
    mutationFn: () =>
      talentService.applyNextCyclePlan(
        idSeason ?? 0,
        buildApplyPayload(target?.id_season ?? 0, overrideList),
      ),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.talent.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      ])
      setConfirming(false)
      setDecisions({ key: '', values: {} })
      setSummary(result)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    season,
    hasSeason: idSeason !== undefined,
    plan,
    target,
    rows,
    pagination: plan?.pagination,
    setPage,
    isLoading: idSeason !== undefined && planQuery.isPending,
    errorMessage: planQuery.isError ? parseApiError(planQuery.error) : undefined,
    retry: () => void planQuery.refetch(),
    targetValue: target ? String(target.id_season) : undefined,
    targetOptions: seasons
      .filter((item) => season && item.start_date > season.start_date)
      .map((item) => ({
        value: String(item.id_season),
        label: `${item.name} · ${SEASON_STATUS.labels[item.status]}`,
      })),
    onTargetChange: (value: string) => setTargetId(Number(value)),
    canPlan,
    canApply,
    categoryOptionsFor: (athlete: PlannedAthlete) =>
      athlete.eligible_category_ids.map((id) => ({ value: String(id), label: categoryName(id) })),
    toggleInclude: (idUser: number, include: boolean) => update(idUser, { include }),
    changeCategory: (idUser: number, value: string) =>
      update(idUser, { idCategory: Number(value) }),
    togglePromote: (idUser: number, promote: boolean) => update(idUser, { promote }),
    toggleCarry: (idUser: number, carry: boolean) => update(idUser, { carry }),
    applicableCount,
    confirming,
    askApply: () => setConfirming(true),
    cancelApply: () => setConfirming(false),
    apply: () => applyMutation.mutate(),
    isApplying: applyMutation.isPending,
    summary,
    closeSummary: () => setSummary(null),
    failureName: (failure: FailedAthlete) =>
      failure.athlete_name || `Deportista ${failure.id_user}`,
  }
}
