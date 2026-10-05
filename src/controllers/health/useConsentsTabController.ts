import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { PARENTAL_CONSENT_STATUS, type ParentalConsentStatus } from '@/constants/enums'
import { useMinorsWithoutConsent } from '@/controllers/health/useMinorsWithoutConsent'
import { useResourceMutation } from '@/controllers/shared/useResourceMutation'
import { queryKeys } from '@/lib/queryKeys'
import {
  parentalConsentsService,
  type ParentalConsentFilters,
} from '@/services/parentalConsentsService'
import type { ParentalConsent } from '@/types/club'
import { parseApiError } from '@/utils/parseApiError'

const PAGE_SIZE = 10
const ALL = 'all'

type SheetState =
  | { mode: 'closed' }
  | { mode: 'create'; athleteId?: number }
  | { mode: 'edit'; consent: ParentalConsent }

type PendingAction =
  { kind: 'revoke'; consent: ParentalConsent } | { kind: 'delete'; consent: ParentalConsent } | null

export function useConsentsTabController() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<ParentalConsentStatus | typeof ALL>(ALL)
  const [sheet, setSheet] = useState<SheetState>({ mode: 'closed' })
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const filters: ParentalConsentFilters = {
    page,
    limit: PAGE_SIZE,
    status: status === ALL ? undefined : status,
  }

  const pageQuery = useQuery({
    queryKey: queryKeys.parentalConsents.list(filters),
    queryFn: () => parentalConsentsService.listPage(filters),
    placeholderData: keepPreviousData,
  })
  const minors = useMinorsWithoutConsent()

  const invalidate = [queryKeys.parentalConsents.all, queryKeys.athlete.root]

  const statusMutation = useResourceMutation({
    mutationFn: ({ consent, next }: { consent: ParentalConsent; next: ParentalConsentStatus }) =>
      parentalConsentsService.update(consent.id_consent, { status: next }),
    invalidate,
    successMessage: ({ consent, next }) =>
      next === 'granted'
        ? `Consentimiento de ${consent.athlete_name || 'el deportista'} otorgado.`
        : `Consentimiento de ${consent.athlete_name || 'el deportista'} revocado.`,
    onSuccess: () => setPendingAction(null),
  })

  const deleteMutation = useResourceMutation({
    mutationFn: (consent: ParentalConsent) => parentalConsentsService.remove(consent.id_consent),
    invalidate,
    successMessage: (consent) =>
      `Consentimiento de ${consent.athlete_name || 'el deportista'} eliminado.`,
    onSuccess: () => setPendingAction(null),
  })

  return {
    consents: pageQuery.data?.items ?? [],
    pagination: pageQuery.data?.pagination,
    setPage,
    isLoading: pageQuery.isPending,
    errorMessage: pageQuery.isError ? parseApiError(pageQuery.error) : undefined,
    retry: () => void pageQuery.refetch(),
    hasFilters: status !== ALL,
    status,
    setStatus: (value: string) => {
      setStatus(value as ParentalConsentStatus | typeof ALL)
      setPage(1)
    },
    statusOptions: [
      { value: ALL, label: 'Todos los estados' },
      ...PARENTAL_CONSENT_STATUS.options.map(({ value, label }) => ({ value, label })),
    ],
    minors,
    sheet,
    openCreate: (athleteId?: number) => setSheet({ mode: 'create', athleteId }),
    openEdit: (consent: ParentalConsent) => setSheet({ mode: 'edit', consent }),
    closeSheet: () => setSheet({ mode: 'closed' }),
    grant: (consent: ParentalConsent) => statusMutation.mutate({ consent, next: 'granted' }),
    pendingAction,
    askRevoke: (consent: ParentalConsent) => setPendingAction({ kind: 'revoke', consent }),
    askDelete: (consent: ParentalConsent) => setPendingAction({ kind: 'delete', consent }),
    cancelAction: () => setPendingAction(null),
    confirmAction: () => {
      if (!pendingAction) return
      if (pendingAction.kind === 'revoke')
        statusMutation.mutate({ consent: pendingAction.consent, next: 'revoked' })
      else deleteMutation.mutate(pendingAction.consent)
    },
    isActing: statusMutation.isPending || deleteMutation.isPending,
  }
}
