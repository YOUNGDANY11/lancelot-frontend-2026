import { useQuery } from '@tanstack/react-query'
import { useWatch } from 'react-hook-form'
import { HEALTH_RECORD_STATUS } from '@/constants/enums'
import { HEALTH_CONDITION_TYPES } from '@/constants/health'
import { useAthleteOptions } from '@/controllers/health/useAthleteOptions'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  healthRecordSchema,
  toHealthRecordRequest,
  type HealthRecordFormValues,
} from '@/schemas/healthSchemas'
import { healthService } from '@/services/healthService'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import type { HealthRecord } from '@/types/athlete'
import { calculateAge, isMinor } from '@/utils/age'

export function useHealthRecordFormController({
  record,
  onDone,
}: {
  record?: HealthRecord | null
  onDone: () => void
}) {
  const { user } = useAuth()
  const isEditing = Boolean(record)

  const grantedQuery = useQuery({
    queryKey: queryKeys.parentalConsents.list({ status: 'granted', scope: 'all' }),
    queryFn: () => parentalConsentsService.listAll({ status: 'granted' }),
  })
  const withConsent = new Set((grantedQuery.data ?? []).map((consent) => consent.id_user))
  const needsConsent = (idUser: number, birthDate: string | null | undefined) =>
    isMinor(birthDate ?? null) && !withConsent.has(idUser)

  const athletes = useAthleteOptions((athlete) => {
    if (needsConsent(athlete.id_user, athlete.birth_date))
      return `${calculateAge(athlete.birth_date)} años · menor sin consentimiento otorgado`
    return undefined
  })

  const controller = useEntityFormController<HealthRecordFormValues>({
    schema: healthRecordSchema,
    defaultValues: record
      ? {
          id_user: record.id_user,
          condition_type: record.condition_type,
          description: record.description ?? '',
          restriction: record.restriction,
          status: record.status,
        }
      : { id_user: 0, condition_type: '', description: '', restriction: false, status: 'active' },
    submit: (values) => {
      const request = toHealthRecordRequest(values)
      if (record) return healthService.updateHealthRecord(record.id_health, request)
      if (user?.id_user === undefined) throw new Error('Vuelve a iniciar sesión.')
      return healthService.createHealthRecord({
        ...request,
        id_user: values.id_user,
        registered_by: user.id_user,
      })
    },
    invalidate: [queryKeys.health.all, queryKeys.athlete.root],
    successMessage: () => (record ? 'Registro de salud actualizado.' : 'Registro de salud creado.'),
    onDone,
    fieldMatchers: [{ field: 'id_user', pattern: /deportista|menor|consentimiento/i }],
  })

  const selectedId = useWatch({ control: controller.form.control, name: 'id_user' })
  const selected = athletes.athletes.find((athlete) => athlete.id_user === selectedId)

  return {
    ...controller,
    isEditing,
    athleteName: record?.athlete_name,
    athleteOptions: athletes.options,
    isLoadingAthletes: athletes.isLoading || grantedQuery.isPending,
    selectedNeedsConsent: Boolean(selected && needsConsent(selected.id_user, selected.birth_date)),
    conditionSuggestions: HEALTH_CONDITION_TYPES,
    statusOptions: HEALTH_RECORD_STATUS.options.map(({ value, label }) => ({ value, label })),
  }
}
