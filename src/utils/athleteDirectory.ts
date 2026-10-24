import type { AthleteAssignment } from '@/types/club'
import type { User } from '@/types/user'
import { calculateAge } from '@/utils/age'
import { sortByAgeGroup } from '@/utils/categoryEligibility'

export interface AthleteDirectoryEntry {
  id_user: number
  name: string
  lastname: string
  email: string
  age: number | null
  id_category: number | null
  category_name: string | null
  category_ids: number[]
  position: string | null
}

export function buildAthleteDirectory(
  athletes: User[],
  assignments: AthleteAssignment[],
  maxAgeById: Map<number, number> = new Map(),
): AthleteDirectoryEntry[] {
  const assignmentsByUser = new Map<number, AthleteAssignment[]>()
  for (const assignment of assignments) {
    assignmentsByUser.set(assignment.id_user, [
      ...(assignmentsByUser.get(assignment.id_user) ?? []),
      assignment,
    ])
  }
  return athletes.map((athlete) => {
    const own = sortByAgeGroup(assignmentsByUser.get(athlete.id_user) ?? [], maxAgeById)
    const base = own[0]
    return {
      id_user: athlete.id_user,
      name: athlete.name,
      lastname: athlete.lastname,
      email: athlete.email,
      age: calculateAge(athlete.birth_date),
      id_category: base?.id_category ?? null,
      category_name:
        own
          .map((assignment) => assignment.category_name)
          .filter(Boolean)
          .join(' · ') || null,
      category_ids: own.flatMap((assignment) =>
        assignment.id_category !== undefined ? [assignment.id_category] : [],
      ),
      position: base?.position ?? null,
    }
  })
}
