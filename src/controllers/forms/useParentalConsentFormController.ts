import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { AthleteOption } from '@/components/common/AthletePicker'
import { queryKeys } from '@/lib/queryKeys'
import {
  GUARDIAN_RELATIONSHIPS,
  parentalConsentSchema,
  toCreateParentalConsentRequest,
  type ParentalConsentFormValues,
} from '@/schemas/healthSchemas'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { usersService } from '@/services/usersService'
import { calculateAge, isMinor } from '@/utils/age'
import { todayApiDate } from '@/utils/formatDate'
import { applyServerError, serverErrorOf } from '@/utils/formErrors'
import { fullName } from '@/utils/text'

function emptyConsent(): ParentalConsentFormValues {
  return {
    id_user: 0,
    guardian_name: '',
    guardian_document: '',
    guardian_relationship: '',
    signed_at: todayApiDate(),
    document_url: '',
    status: 'granted',
  }
}

export function useParentalConsentFormController({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const form = useForm<ParentalConsentFormValues>({
    resolver: zodResolver(parentalConsentSchema),
    defaultValues: emptyConsent(),
    mode: 'onTouched',
  })

  const athletesQuery = useQuery({
    queryKey: queryKeys.users.athletes(),
    queryFn: usersService.listAllAthletes,
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
      parentalConsentsService.create(toCreateParentalConsentRequest(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.parentalConsents.all })
      toast.success('Consentimiento registrado.')
      form.reset(emptyConsent())
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
    isLoadingAthletes: athletesQuery.isPending || grantedQuery.isPending,
    relationshipOptions: GUARDIAN_RELATIONSHIPS.map((value) => ({ value, label: value })),
    statusOptions: [
      { value: 'granted', label: 'Otorgado' },
      { value: 'pending', label: 'Pendiente de firma' },
    ],
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
