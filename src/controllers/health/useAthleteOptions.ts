import { useQuery } from '@tanstack/react-query'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { queryKeys } from '@/lib/queryKeys'
import { usersService } from '@/services/usersService'
import type { User } from '@/types/user'
import { fullName } from '@/utils/text'

export function useAthleteOptions(describe?: (athlete: User) => string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
  })
  const athletes = query.data ?? []

  const options: AthleteOption[] = athletes
    .map((athlete) => ({
      id: athlete.id_user,
      label: fullName(athlete),
      hint: describe?.(athlete),
    }))
    .sort((first, second) => first.label.localeCompare(second.label, 'es'))

  return { athletes, options, isLoading: query.isPending }
}
