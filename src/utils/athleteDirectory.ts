import type { AthleteAssignment } from '@/types/club'
import type { User } from '@/types/user'
import { calculateAge } from '@/utils/age'
import { matchesSearch } from '@/utils/text'

export interface AthleteDirectoryEntry {
  id_user: number
  name: string
  lastname: string
  email: string
  age: number | null
  id_category: number | null
  category_name: string | null
  position: string | null
}

export function buildAthleteDirectory(
  athletes: User[],
  assignments: AthleteAssignment[],
): AthleteDirectoryEntry[] {
  const assignmentByUser = new Map(
    assignments.map((assignment) => [assignment.id_user, assignment]),
  )
  return athletes
    .map((athlete) => {
      const assignment = assignmentByUser.get(athlete.id_user)
      return {
        id_user: athlete.id_user,
        name: athlete.name,
        lastname: athlete.lastname,
        email: athlete.email,
        age: calculateAge(athlete.birth_date),
        id_category: assignment?.id_category ?? null,
        category_name: assignment?.category_name ?? null,
        position: assignment?.position ?? null,
      }
    })
    .sort((first, second) =>
      `${first.lastname} ${first.name}`.localeCompare(`${second.lastname} ${second.name}`),
    )
}

export interface DirectoryFilters {
  search: string
  idCategory: number | null
  onlyUnassigned: boolean
}

export function filterAthleteDirectory(
  entries: AthleteDirectoryEntry[],
  { search, idCategory, onlyUnassigned }: DirectoryFilters,
): AthleteDirectoryEntry[] {
  return entries.filter((entry) => {
    if (onlyUnassigned && entry.id_category !== null) return false
    if (!onlyUnassigned && idCategory !== null && entry.id_category !== idCategory) return false
    return matchesSearch(`${entry.name} ${entry.lastname}`, search)
  })
}
