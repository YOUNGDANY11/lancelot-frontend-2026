import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { queryKeys } from '@/lib/queryKeys'
import { PARENTAL_CONSENT_STATUS } from '@/constants/enums'
import {
  GUARDIAN_RELATIONSHIPS,
  parentalConsentSchema,
  toCreateParentalConsentRequest,
  toUpdateParentalConsentRequest,
  type ParentalConsentFormValues,
} from '@/schemas/healthSchemas'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { usersService } from '@/services/usersService'
import type { ParentalConsent } from '@/types/club'
import { calculateAge, isMinor } from '@/utils/age'
import { todayApiDate } from '@/utils/formatDate'
import { applyServerError, serverErrorOf } from '@/utils/formErrors'
import { fullName } from '@/utils/text'

function defaultsFor(
  consent: ParentalConsent | null | undefined,
  initialAthleteId: number | undefined,
): ParentalConsentFormValues {
  if (consent) {
    return {
      id_user: consent.id_user,
      guardian_name: consent.guardian_name,
      guardian_document: consent.guardian_document,
      guardian_relationship: consent.guardian_relationship,
      signed_at: consent.signed_at,
      document_url: consent.document_url ?? '',
      status: consent.status,
    }
  }
  return {
    id_user: initialAthleteId ?? 0,
    guardian_name: '',
    guardian_document: '',
    guardian_relationship: '',
    signed_at: todayApiDate(),
    document_url: '',
    status: 'granted',
  }
}

export function useParentalConsentFormController({
  consent,
  initialAthleteId,
  onDone,
}: {
  consent?: ParentalConsent | null
  initialAthleteId?: number
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(consent)
  const form = useForm<ParentalConsentFormValues>({
    resolver: zodResolver(parentalConsentSchema),
    defaultValues: defaultsFor(consent, initialAthleteId),
    mode: 'onTouched',
  })

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
    enabled: !isEditing,
  })

  const grantedQuery = useQuery({
    queryKey: queryKeys.parentalConsents.list({ status: 'granted', scope: 'all' }),
    queryFn: () => parentalConsentsService.listAll({ status: 'granted' }),
  })

  const withConsent = new Set((grantedQuery.data ?? []).map((consent) => consent.id_user))
  const minorOptions: AthleteOption[] = (athletesQuery.data ?? [])
    .filter((athlete) => isMinor(athlete.birth_date) && !withConsent.has(athlete.id_user))
    .map((athlete) => ({
      id: athlete.id_user,
      label: fullName(athlete),
      hint: `${calculateAge(athlete.birth_date)} años · sin consentimiento otorgado`,
    }))

  const mutation = useMutation({
    mutationFn: (values: ParentalConsentFormValues) =>
      consent
        ? parentalConsentsService.update(consent.id_consent, toUpdateParentalConsentRequest(values))
        : parentalConsentsService.create(toCreateParentalConsentRequest(values)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.parentalConsents.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      ])
      toast.success(consent ? 'Consentimiento actualizado.' : 'Consentimiento registrado.')
      onDone()
    },
    onError: (error) =>
      applyServerError(form, error, [
        { field: 'id_user', pattern: /deportista|menor|nacimiento/i },
      ]),
  })

  return {
    form,
    minorOptions,
    isLoadingAthletes: !isEditing && (athletesQuery.isPending || grantedQuery.isPending),
    relationshipOptions: GUARDIAN_RELATIONSHIPS.map((value) => ({ value, label: value })),
    isEditing,
    athleteName: consent?.athlete_name,
    statusOptions: isEditing
      ? PARENTAL_CONSENT_STATUS.options.map(({ value, label }) => ({ value, label }))
      : [
          { value: 'granted', label: 'Otorgado' },
          { value: 'pending', label: 'Pendiente de firma' },
        ],
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
