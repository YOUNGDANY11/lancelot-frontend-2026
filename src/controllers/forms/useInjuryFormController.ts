import { INJURY_MECHANISM, INJURY_SEVERITY, INJURY_STATUS } from '@/constants/enums'
import { BODY_PARTS } from '@/constants/health'
import { useAthleteOptions } from '@/controllers/health/useAthleteOptions'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import { injurySchema, toInjuryRequest, type InjuryFormValues } from '@/schemas/healthSchemas'
import { healthService } from '@/services/healthService'
import type { Injury } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

function defaultsFor(injury: Injury | null | undefined): InjuryFormValues {
  if (!injury) {
    return {
      id_user: 0,
      injury_date: todayApiDate(),
      body_part: '',
      severity: '' as InjuryFormValues['severity'],
      mechanism: '' as InjuryFormValues['mechanism'],
      status: 'active',
      diagnosis: '',
      recovery_date: '',
      time_loss_days: '',
    }
  }
  return {
    id_user: injury.id_user,
    injury_date: injury.injury_date,
    body_part: injury.body_part,
    severity: injury.severity,
    mechanism: (injury.mechanism ?? '') as InjuryFormValues['mechanism'],
    status: injury.status,
    diagnosis: injury.diagnosis ?? '',
    recovery_date: injury.recovery_date ?? '',
    time_loss_days:
      injury.time_loss_days !== null && injury.time_loss_days !== undefined
        ? String(injury.time_loss_days)
        : '',
  }
}

export function useInjuryFormController({
  injury,
  onDone,
}: {
  injury?: Injury | null
  onDone: () => void
}) {
  const { user } = useAuth()
  const isEditing = Boolean(injury)
  const athletes = useAthleteOptions()

  const controller = useEntityFormController<InjuryFormValues>({
    schema: injurySchema,
    defaultValues: defaultsFor(injury),
    submit: (values) => {
      const request = toInjuryRequest(values, isEditing)
      if (injury) return healthService.updateInjury(injury.id_injury, request)
      if (user?.id_user === undefined) throw new Error('Vuelve a iniciar sesión.')
      return healthService.createInjury({ ...request, registered_by: user.id_user })
    },
    invalidate: [queryKeys.health.all, queryKeys.athlete.root],
    successMessage: (values) =>
      injury
        ? `Lesión de ${values.body_part} actualizada.`
        : `Lesión de ${values.body_part} registrada.`,
    onDone,
    fieldMatchers: [{ field: 'id_user', pattern: /deportista/i }],
  })

  return {
    ...controller,
    isEditing,
    athleteName: injury?.athlete_name,
    athleteOptions: athletes.options,
    isLoadingAthletes: athletes.isLoading,
    bodyPartSuggestions: BODY_PARTS,
    severityOptions: INJURY_SEVERITY.options.map(({ value, label }) => ({ value, label })),
    statusOptions: INJURY_STATUS.options.map(({ value, label }) => ({ value, label })),
    mechanismOptions: INJURY_MECHANISM.options.map(({ value, label }) => ({ value, label })),
  }
}
