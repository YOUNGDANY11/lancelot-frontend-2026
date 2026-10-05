import { useQuery } from '@tanstack/react-query'
import {
  ATHLETE_PROFILE_TAB_LABELS,
  athleteTabsForRole,
  type AthleteProfileTab,
} from '@/constants/athleteProfile'
import { useAppContext } from '@/hooks/useAppContext'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { usersService } from '@/services/usersService'
import { calculateAge } from '@/utils/age'
import { sortByAgeGroup } from '@/utils/categoryEligibility'
import { parseApiError } from '@/utils/parseApiError'
import { fullName, initialsOf } from '@/utils/text'

export interface AthleteBasics {
  id_user: number
  name: string
  lastname: string
  email: string
  birth_date: string | null
}

export function parseAthleteId(rawId: string | undefined): number | null {
  const id = Number(rawId)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function useAthleteProfileController(rawId: string | undefined) {
  const { role, user } = useAuth()
  const { season, categories } = useAppContext()
  const idUser = parseAthleteId(rawId)
  const isAthleteRole = role === 'DEPORTISTA'
  const isSelf = user !== null && user.id_user === idUser
  const idSeason = season?.id_season

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
    enabled: !isAthleteRole && idUser !== null,
  })
  const seasonAssignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: !isAthleteRole && idSeason !== undefined,
  })
  const myAssignmentQuery = useQuery({
    queryKey: queryKeys.assignments.mine(),
    queryFn: athleteAssignmentsService.getMine,
    enabled: isAthleteRole,
  })

  const athlete: AthleteBasics | null =
    isAthleteRole && isSelf && user
      ? user
      : ((athletesQuery.data ?? []).find((item) => item.id_user === idUser) ?? null)
  const maxAgeById = new Map(
    categories.flatMap((item) =>
      item.max_age !== undefined ? [[item.id_category, item.max_age] as const] : [],
    ),
  )
  const assignments = isAthleteRole
    ? (myAssignmentQuery.data ?? [])
    : sortByAgeGroup(
        (seasonAssignmentsQuery.data ?? []).filter((item) => item.id_user === idUser),
        maxAgeById,
      )
  const assignment = assignments[0] ?? null
  const tabs: AthleteProfileTab[] = athleteTabsForRole(role)
  const age = calculateAge(athlete?.birth_date)

  return {
    idUser,
    isForbidden: isAthleteRole && !isSelf,
    isNotFound: idUser === null || (!isAthleteRole && athletesQuery.isSuccess && athlete === null),
    isLoading: !isAthleteRole && athletesQuery.isPending,
    errorMessage: athletesQuery.isError ? parseApiError(athletesQuery.error) : undefined,
    retry: () => void athletesQuery.refetch(),
    athlete,
    fullName: athlete ? fullName(athlete) : '',
    initials: athlete ? initialsOf(athlete) : '',
    age,
    birthDate: athlete?.birth_date ?? null,
    email: !isAthleteRole ? athlete?.email : undefined,
    categoryName:
      assignments
        .map((item) => item.category_name)
        .filter(Boolean)
        .join(' · ') || null,
    position: assignment?.position ?? null,
    seasonName: season?.name,
    tabs: tabs.map((tab) => ({ value: tab, label: ATHLETE_PROFILE_TAB_LABELS[tab] })),
    defaultTab: tabs[0] ?? 'carga',
  }
}
