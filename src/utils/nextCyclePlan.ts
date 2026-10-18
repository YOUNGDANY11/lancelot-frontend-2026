import type { ApplyPlanRequest, PlannedAthlete } from '@/types/talent'

export interface PlanDecision {
  include: boolean
  idCategory: number | null
  promote: boolean
  carry: boolean
}

export function defaultDecision(athlete: PlannedAthlete): PlanDecision {
  return {
    include: athlete.suggested_category !== null && athlete.planned_categories.length === 0,
    idCategory: athlete.suggested_category?.id_category ?? null,
    promote: athlete.promotion_category !== null,
    carry: athlete.open_objectives.length > 0,
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

export function buildApplyPayload(
  idTarget: number,
  rows: { athlete: PlannedAthlete; decision: PlanDecision }[],
): ApplyPlanRequest {
  return {
    id_target_season: idTarget,
    athletes: rows
      .filter((row) => isApplicable(row.decision))
      .map(({ athlete, decision }) => ({
        id_user: athlete.id_user,
        id_category: decision.idCategory as number,
        id_promotion_category:
          decision.promote && athlete.promotion_category
            ? athlete.promotion_category.id_category
            : null,
        carry_objectives: decision.carry && athlete.open_objectives.length > 0,
      })),
  }
}
