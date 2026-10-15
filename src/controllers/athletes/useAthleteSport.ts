import { useQuery } from '@tanstack/react-query'
import type { Sport } from '@/constants/enums'
import { sportOf } from '@/constants/positions'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'

export function useAthleteSport(idUser: number): Sport | null {
  const { role } = useRole()
  const { season, categories } = useAppContext()
  const idSeason = season?.id_season
  const isAthlete = role === 'DEPORTISTA'
  const assignmentsQuery = useQuery({
    queryKey: queryKeys.assignments.list({ id_season: idSeason, scope: 'all' }),
    queryFn: () => athleteAssignmentsService.listAll({ id_season: idSeason }),
    enabled: !isAthlete && idSeason !== undefined,
  })
  const mineQuery = useQuery({
    queryKey: queryKeys.assignments.mine(),
    queryFn: athleteAssignmentsService.getMine,
    enabled: isAthlete,
  })
  const assignments = isAthlete
    ? (mineQuery.data ?? [])
    : (assignmentsQuery.data ?? []).filter((item) => item.id_user === idUser)
  const sports = new Set(
    assignments.flatMap((assignment) => {
      const category = categories.find((item) => item.id_category === assignment.id_category)
      return category?.sport ? [sportOf(category)] : []
    }),
  )
  return sports.size === 1 ? [...sports][0] : null
}
