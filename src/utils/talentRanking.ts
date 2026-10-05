import type { AthleteAssignment } from '@/types/club'
import type { RankedIndex } from '@/types/talent'
import { sortByAgeGroup } from '@/utils/categoryEligibility'
import { fullName } from '@/utils/text'

export interface RankingEntry {
  index: RankedIndex
  rank: number
  athleteName: string
  id_category: number | null
  category_name: string | null
  position: string | null
}

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

export function buildRanking(
  indices: RankedIndex[],
  baseByUser: Map<number, AthleteAssignment>,
  idCategory: number | null,
): RankingEntry[] {
  return indices
    .map((index) => {
      const base = baseByUser.get(index.id_user)
      return {
        index,
        athleteName: index.athlete_name || (base ? fullName(base) : 'Deportista'),
        id_category: base?.id_category ?? null,
        category_name: base?.category_name ?? null,
        position: base?.position ?? null,
      }
    })
    .filter((entry) => idCategory === null || entry.id_category === idCategory)
    .sort(
      (first, second) =>
        second.index.index_value - first.index.index_value ||
        first.athleteName.localeCompare(second.athleteName, 'es'),
    )
    .map((entry, position) => ({ ...entry, rank: position + 1 }))
}

export function athletesWithoutIndex(
  baseByUser: Map<number, AthleteAssignment>,
  indices: RankedIndex[],
  idCategory: number | null,
): AthleteAssignment[] {
  const indexed = new Set(indices.map((index) => index.id_user))
  return [...baseByUser.values()].filter(
    (assignment) =>
      !indexed.has(assignment.id_user) &&
      (idCategory === null || assignment.id_category === idCategory),
  )
}
