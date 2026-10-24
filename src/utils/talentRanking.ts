import type { AthleteAssignment } from '@/types/club'
import { sortByAgeGroup } from '@/utils/categoryEligibility'

export function baseAssignmentByUser(
  assignments: AthleteAssignment[],
  maxAgeById: Map<number, number>,
): Map<number, AthleteAssignment> {
  const grouped = new Map<number, AthleteAssignment[]>()
  for (const assignment of assignments) {
    grouped.set(assignment.id_user, [...(grouped.get(assignment.id_user) ?? []), assignment])
  }
  return new Map(
    [...grouped.entries()].map(([idUser, own]) => [idUser, sortByAgeGroup(own, maxAgeById)[0]]),
  )
}
