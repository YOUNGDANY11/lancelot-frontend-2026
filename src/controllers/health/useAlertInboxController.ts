import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { APP_MODULES } from '@/constants/navigation'
import type { ReviewStatus, RiskLevelValue } from '@/constants/enums'
import { queryKeys } from '@/lib/queryKeys'
import { healthService } from '@/services/healthService'
import type { InboxItem, InboxKind, ReviewDecision } from '@/types/health'
import { buildInbox, countByLevel, filterInbox } from '@/utils/alertInbox'
import { parseApiError } from '@/utils/parseApiError'

async function loadInbox(): Promise<InboxItem[]> {
  const [alerts, assessments] = await Promise.all([
    healthService.listOpenFatigueAlerts(),
    healthService.listOpenRiskAssessments(),
  ])
  return buildInbox(alerts, assessments)
}

function sendReview(item: InboxItem, status: ReviewStatus) {
  return item.kind === 'fatigue'
    ? healthService.reviewFatigueAlert(item.id, status)
    : healthService.reviewRiskAssessment(item.id, status)
}

const ITEM_NOUNS: Record<InboxItem['kind'], string> = {
  fatigue: 'La alerta de fatiga',
  risk: 'La evaluación de riesgo',
}

const DECISION_MESSAGES: Record<ReviewDecision['status'], string> = {
  reviewed: 'quedó revisada',
  dismissed: 'quedó descartada',
}

export function useAlertInboxController({
  limit,
  withTotals = false,
}: { limit?: number; withTotals?: boolean } = {}) {
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<InboxKind | 'all'>('all')
  const [level, setLevel] = useState<RiskLevelValue | 'all'>('all')

  const inboxQuery = useQuery({ queryKey: queryKeys.alerts.inbox(), queryFn: loadInbox })
  const totalsQuery = useQuery({
    queryKey: queryKeys.alerts.reviewTotals(),
    queryFn: healthService.reviewTotals,
    enabled: withTotals,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
    ])

  const undo = useMutation({
    mutationFn: (item: InboxItem) => sendReview(item, 'open'),
    onSuccess: async (_data, item) => {
      await refresh()
      toast.success(`La alerta de ${item.athleteName} volvió a la bandeja.`)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const review = useMutation({
    mutationFn: ({ item, status }: ReviewDecision) => sendReview(item, status),
    onSuccess: async (_data, { item, status }) => {
      queryClient.setQueryData<InboxItem[]>(queryKeys.alerts.inbox(), (current) =>
        current?.filter((candidate) => candidate.key !== item.key),
      )
      await refresh()
      toast.success(
        `${ITEM_NOUNS[item.kind]} de ${item.athleteName} ${DECISION_MESSAGES[status]}.`,
        { action: { label: 'Deshacer', onClick: () => undo.mutate(item) } },
      )
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const items = inboxQuery.data ?? []
  const filtered = filterInbox(items, kind, level)

  return {
    items: limit === undefined ? filtered : items.slice(0, limit),
    totalOpen: items.length,
    kindCounts: {
      all: items.length,
      fatigue: items.filter((item) => item.kind === 'fatigue').length,
      risk: items.filter((item) => item.kind === 'risk').length,
    } satisfies Record<InboxKind | 'all', number>,
    levelCounts: countByLevel(items),
    reviewTotals: totalsQuery.data,
    kind,
    setKind,
    level,
    setLevel,
    isLoading: inboxQuery.isPending,
    errorMessage: inboxQuery.isError ? parseApiError(inboxQuery.error) : undefined,
    retry: () => void inboxQuery.refetch(),
    decide: (item: InboxItem, status: ReviewDecision['status']) => review.mutate({ item, status }),
    pendingKey: review.isPending ? review.variables?.item.key : undefined,
    athletePath: (item: InboxItem) => `${APP_MODULES.athletes.path}/${item.id_user}?tab=carga`,
  }
}
