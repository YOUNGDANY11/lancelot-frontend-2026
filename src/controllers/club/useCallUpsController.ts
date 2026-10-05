import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { useRole } from '@/hooks/useRole'
import { queryKeys } from '@/lib/queryKeys'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { competitionService } from '@/services/competitionService'
import type { CallUp, Competency } from '@/types/competition'
import { parseApiError } from '@/utils/parseApiError'
import { fullName } from '@/utils/text'

export function useCallUpsController(competency: Competency) {
  const { can } = useRole()
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

  const callUps = callUpsQuery.data ?? []
  const calledIds = new Set(callUps.map((callUp) => callUp.id_user))
  const options: AthleteOption[] = (rosterQuery.data ?? [])
    .filter((assignment) => !calledIds.has(assignment.id_user))
    .map((assignment) => ({
      id: assignment.id_user,
      label: fullName(assignment),
      hint: assignment.position ?? undefined,
    }))

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
    isLoadingOptions: rosterQuery.isPending,
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
