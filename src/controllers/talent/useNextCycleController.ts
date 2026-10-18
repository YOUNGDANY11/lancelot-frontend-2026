import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { SEASON_STATUS } from '@/constants/enums'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { talentService } from '@/services/talentService'
import type { ApplyPlanSummary, PlannedAthlete } from '@/types/talent'
import { parseApiError } from '@/utils/parseApiError'
import {
  buildApplyPayload,
  isApplicable,
  resolveDecision,
  type PlanDecision,
} from '@/utils/nextCyclePlan'
import { fullName } from '@/utils/text'

interface DecisionState {
  key: string
  values: Record<number, Partial<PlanDecision>>
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

  const planQuery = useQuery({
    queryKey: queryKeys.talent.plan(idSeason ?? 0, targetId),
    queryFn: () => talentService.getNextCyclePlan(idSeason ?? 0, targetId),
    enabled: idSeason !== undefined,
  })
  const plan = planQuery.data
  const target = plan?.target ?? null
  const canPlan = can('planNextCycle')
  const canApply = canPlan && target !== null && target.status !== 'closed'

  const rows = (plan?.athletes ?? []).map((athlete) => ({
    athlete,
    decision: resolveDecision(athlete, overrides[athlete.id_user]),
  }))
  const applicableCount = rows.filter((row) => isApplicable(row.decision)).length
  const categoryName = (idCategory: number) =>
    categories.find((item) => item.id_category === idCategory)?.name ?? `Categoría ${idCategory}`

  const update = (idUser: number, patch: Partial<PlanDecision>) =>
    setDecisions((previous) => {
      const values = previous.key === stateKey ? previous.values : {}
      return { key: stateKey, values: { ...values, [idUser]: { ...values[idUser], ...patch } } }
    })

  const applyMutation = useMutation({
    mutationFn: () =>
      talentService.applyNextCyclePlan(
        idSeason ?? 0,
        buildApplyPayload(target?.id_season ?? 0, rows),
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

  const nameOf = (idUser: number) => {
    const athlete = plan?.athletes.find((item) => item.id_user === idUser)
    return athlete ? fullName(athlete) : `Deportista ${idUser}`
  }

  return {
    season,
    hasSeason: idSeason !== undefined,
    plan,
    target,
    rows,
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
    nameOf,
  }
}
