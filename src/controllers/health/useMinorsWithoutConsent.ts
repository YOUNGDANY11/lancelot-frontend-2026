import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { usersService } from '@/services/usersService'
import type { ParentalConsent } from '@/types/club'
import { calculateAge, isMinor } from '@/utils/age'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

export interface MinorWithoutConsent {
  id_user: number
  name: string
  age: number | null
  latest?: ParentalConsent
}

function latestFirst(first: ParentalConsent, second: ParentalConsent) {
  return second.signed_at.localeCompare(first.signed_at) || second.id_consent - first.id_consent
}

export function useMinorsWithoutConsent() {
  const allConsentsQuery = useQuery({
    queryKey: queryKeys.parentalConsents.list({ scope: 'every-status' }),
    queryFn: () => parentalConsentsService.listAll(),
  })
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })

  const consentsByUser = new Map<number, ParentalConsent[]>()
  for (const consent of allConsentsQuery.data ?? []) {
    consentsByUser.set(consent.id_user, [...(consentsByUser.get(consent.id_user) ?? []), consent])
  }

  const items: MinorWithoutConsent[] = (athletesQuery.data ?? [])
    .filter((athlete) => isMinor(athlete.birth_date ?? null))
    .filter(
      (athlete) =>
        !(consentsByUser.get(athlete.id_user) ?? []).some(
          (consent) => consent.status === 'granted',
        ),
    )
    .map((athlete) => ({
      id_user: athlete.id_user,
      name: fullName(athlete),
      age: calculateAge(athlete.birth_date),
      latest: [...(consentsByUser.get(athlete.id_user) ?? [])].sort(latestFirst)[0],
    }))
    .sort((first, second) => first.name.localeCompare(second.name, 'es'))

  return {
    items,
    isLoading: athletesQuery.isPending || allConsentsQuery.isPending,
    errorMessage:
      athletesQuery.isError || allConsentsQuery.isError
        ? parseApiError(athletesQuery.error ?? allConsentsQuery.error)
        : undefined,
  }
}
