import { SPORT, type Sport } from '@/constants/enums'
import { DEFAULT_SPORT } from '@/constants/positions'
import type { AthleteAssignment } from '@/types/club'
import type { RankedIndex } from '@/types/talent'
import { sortByAgeGroup } from '@/utils/categoryEligibility'
import { fullName } from '@/utils/text'

export interface RankingEntry {
  index: RankedIndex
  rank: number
  athleteName: string
  sport: Sport
  id_category: number | null
  category_name: string | null
  position: string | null
}

export type SportAssignment = AthleteAssignment & { sport: Sport }

export function rankingKey(idUser: number, sport: Sport | null | undefined): string {
  return `${idUser}|${sport ?? DEFAULT_SPORT}`
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

export function baseAssignmentBySport(
  assignments: AthleteAssignment[],
  maxAgeById: Map<number, number>,
  sportById: Map<number, Sport>,
): Map<string, SportAssignment> {
  const grouped = new Map<string, SportAssignment[]>()
  for (const assignment of assignments) {
    const sport =
      (assignment.id_category !== undefined && sportById.get(assignment.id_category)) ||
      DEFAULT_SPORT
    const key = rankingKey(assignment.id_user, sport)
    grouped.set(key, [...(grouped.get(key) ?? []), { ...assignment, sport }])
  }
  return new Map(
    [...grouped.entries()].map(([key, own]) => [key, sortByAgeGroup(own, maxAgeById)[0]]),
  )
}

export function buildRanking(
  indices: RankedIndex[],
  baseBySport: Map<string, SportAssignment>,
  idCategory: number | null,
): RankingEntry[] {
  const sportsByUser = new Map<number, Set<Sport>>()
  for (const index of indices) {
    const sports = sportsByUser.get(index.id_user) ?? new Set<Sport>()
    sports.add(index.sport ?? DEFAULT_SPORT)
    sportsByUser.set(index.id_user, sports)
  }
  return indices
    .map((index) => {
      const sport = index.sport ?? DEFAULT_SPORT
      const base = baseBySport.get(rankingKey(index.id_user, sport))
      const name = index.athlete_name || (base ? fullName(base) : 'Deportista')
      const playsBoth = (sportsByUser.get(index.id_user)?.size ?? 0) > 1
      return {
        index,
        sport,
        athleteName: playsBoth ? `${name} (${SPORT.labels[sport]})` : name,
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
  baseBySport: Map<string, SportAssignment>,
  indices: RankedIndex[],
  idCategory: number | null,
): SportAssignment[] {
  const indexed = new Set(indices.map((index) => rankingKey(index.id_user, index.sport)))
  return [...baseBySport.entries()]
    .filter(
      ([key, assignment]) =>
        !indexed.has(key) && (idCategory === null || assignment.id_category === idCategory),
    )
    .map(([, assignment]) => assignment)
}
