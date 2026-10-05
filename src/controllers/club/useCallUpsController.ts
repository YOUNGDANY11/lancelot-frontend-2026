import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useAppContext } from '@/hooks/useAppContext'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { competitionService } from '@/services/competitionService'
import { usersService } from '@/services/usersService'
import type { CallUp, Competency } from '@/types/competition'
import { checkEligibility, referenceYearOf } from '@/utils/categoryEligibility'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

export function useCallUpsController(competency: Competency) {
  const { can } = useRole()
  const { categories, seasons } = useAppContext()
  const [selectedAthlete, setSelectedAthlete] = useState<number | null>(null)
  const [removing, setRemoving] = useState<CallUp | null>(null)

  const callUpsQuery = useQuery({
    queryKey: queryKeys.callUps.list(competency.id_competency),
    queryFn: () => competitionService.listCallUps(competency.id_competency),
  })
  const rosterFilters = {
    id_category: competency.id_category,
    id_season: competency.id_season,
    scope: 'all',
  }
  const rosterQuery = useQuery({
    queryKey: queryKeys.assignments.list(rosterFilters),
    queryFn: () =>
      athleteAssignmentsService.listAll({
        id_category: competency.id_category,
        id_season: competency.id_season,
      }),
    enabled: can('manageClub'),
  })
  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
    enabled: can('manageClub'),
  })

  const category = categories.find((item) => item.id_category === competency.id_category)
  const referenceYear = referenceYearOf(
    seasons.find((item) => item.id_season === competency.id_season)?.start_date,
  )
  const rosterByUser = new Map(
    (rosterQuery.data ?? []).map((assignment) => [assignment.id_user, assignment]),
  )
  const callUps = callUpsQuery.data ?? []
  const calledIds = new Set(callUps.map((callUp) => callUp.id_user))
  const candidates = (athletesQuery.data ?? [])
    .filter((athlete) => !calledIds.has(athlete.id_user))
    .filter(
      (athlete) =>
        !category || checkEligibility(athlete.birth_date, category, referenceYear).eligible,
    )
  const inRoster = candidates.filter((athlete) => rosterByUser.has(athlete.id_user))
  const playingUp = candidates.filter((athlete) => !rosterByUser.has(athlete.id_user))
  const byName = (first: { label: string }, second: { label: string }) =>
    first.label.localeCompare(second.label, 'es')
  const options: AthleteOption[] = [
    ...inRoster
      .map((athlete) => ({
        id: athlete.id_user,
        label: fullName(athlete),
        hint: [
          `Plantilla ${category?.name ?? ''}`.trim(),
          rosterByUser.get(athlete.id_user)?.position,
        ]
          .filter(Boolean)
          .join(' · '),
      }))
      .sort(byName),
    ...playingUp
      .map((athlete) => ({
        id: athlete.id_user,
        label: fullName(athlete),
        hint: 'Su edad le permite jugar en esta categoría',
      }))
      .sort(byName),
  ]

  const addMutation = useResourceMutation({
    mutationFn: (idUser: number) =>
      competitionService.createCallUp({ id_user: idUser, id_competency: competency.id_competency }),
    invalidate: [queryKeys.callUps.list(competency.id_competency)],
    successMessage: (idUser) =>
      `${options.find((option) => option.id === idUser)?.label ?? 'El deportista'} quedó convocado.`,
    onSuccess: () => setSelectedAthlete(null),
  })

  const removeMutation = useResourceMutation({
    mutationFn: (callUp: CallUp) => competitionService.removeCallUp(callUp.id_ath_comp),
    invalidate: [queryKeys.callUps.list(competency.id_competency)],
    successMessage: (callUp) => `${fullName(callUp)} salió de la convocatoria.`,
    onSuccess: () => setRemoving(null),
  })

  return {
    callUps: [...callUps].sort((first, second) => fullName(first).localeCompare(fullName(second))),
    isLoading: callUpsQuery.isPending,
    errorMessage: callUpsQuery.isError ? parseApiError(callUpsQuery.error) : undefined,
    retry: () => void callUpsQuery.refetch(),
    canManage: can('manageClub'),
    options,
    isLoadingOptions: rosterQuery.isPending || athletesQuery.isPending,
    selectedAthlete,
    setSelectedAthlete,
    add: () => selectedAthlete && addMutation.mutate(selectedAthlete),
    isAdding: addMutation.isPending,
    removing,
    requestRemove: setRemoving,
    cancelRemove: () => setRemoving(null),
    confirmRemove: () => removing && removeMutation.mutate(removing),
    isRemoving: removeMutation.isPending,
  }
}
