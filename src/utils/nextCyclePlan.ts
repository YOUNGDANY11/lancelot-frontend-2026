import type { ApplyPlanRequest, PlannedAthlete } from '@/types/talent'

export interface PlanDecision {
  include: boolean
  idCategory: number | null
  promote: boolean
  carry: boolean
}

export interface PlanOverride {
  athlete: PlannedAthlete
  patch: Partial<PlanDecision>
}

export function defaultDecision(athlete: PlannedAthlete): PlanDecision {
  const suggested = athlete.default_decision
  return {
    include: suggested.include,
    idCategory: suggested.id_category,
    promote: suggested.promote,
    carry: suggested.carry,
  }
}

export function resolveDecision(
  athlete: PlannedAthlete,
  override: Partial<PlanDecision> | undefined,
): PlanDecision {
  return { ...defaultDecision(athlete), ...override }
}

export function isApplicable(decision: PlanDecision) {
  return decision.include && decision.idCategory !== null
}

export function countApplicable(defaultApplicable: number, overrides: PlanOverride[]) {
  return overrides.reduce(
    (count, { athlete, patch }) =>
      count +
      Number(isApplicable(resolveDecision(athlete, patch))) -
      Number(isApplicable(defaultDecision(athlete))),
    defaultApplicable,
  )
}

export function buildApplyPayload(idTarget: number, overrides: PlanOverride[]): ApplyPlanRequest {
  return {
    id_target_season: idTarget,
    overrides: overrides.map(({ athlete, patch }) => {
      const decision = resolveDecision(athlete, patch)
      return {
        id_user: athlete.id_user,
        include: decision.include,
        ...(decision.idCategory !== null ? { id_category: decision.idCategory } : {}),
        promote: decision.promote,
        carry: decision.carry,
      }
    }),
  }
}
