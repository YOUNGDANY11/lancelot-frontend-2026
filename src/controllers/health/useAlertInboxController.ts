import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { APP_MODULES } from '@/constants/navigation'
import type { ReviewStatus, RiskLevelValue } from '@/constants/enums'
import { DEFAULT_PAGE_SIZE, usePagination } from '@/hooks/usePagination'
import { queryKeys } from '@/lib/queryKeys'
import { healthService, type InboxFilters } from '@/services/healthService'
import type { InboxItem, InboxKind, InboxPage, ReviewDecision } from '@/types/health'
import { parseApiError } from '@/utils/parseApiError'

function sendReview(item: InboxItem, status: ReviewStatus) {
  return item.kind === 'fatigue'
    ? healthService.reviewFatigueAlert(item.id, status)
    : healthService.reviewRiskAssessment(item.id, status)
}

function withoutItem(page: InboxPage, item: InboxItem): InboxPage {
  if (!page.items.some((candidate) => candidate.key === item.key)) return page
  const total = Math.max(page.pagination.total - 1, 0)
  return {
    items: page.items.filter((candidate) => candidate.key !== item.key),
    pagination: {
      ...page.pagination,
      total,
      totalPages: Math.ceil(total / page.pagination.limit),
    },
    counts: {
      total: Math.max(page.counts.total - 1, 0),
      byKind: {
        ...page.counts.byKind,
        [item.kind]: Math.max(page.counts.byKind[item.kind] - 1, 0),
      },
      byLevel: {
        ...page.counts.byLevel,
        [item.level]: Math.max(page.counts.byLevel[item.level] - 1, 0),
      },
    },
  }
}

const ITEM_NOUNS: Record<InboxItem['kind'], string> = {
  fatigue: 'La alerta de fatiga',
  risk: 'La evaluación de riesgo',
}

const DECISION_MESSAGES: Record<ReviewDecision['status'], string> = {
  reviewed: 'quedó revisada',
  dismissed: 'quedó descartada',
}

const EMPTY_LEVELS: Record<RiskLevelValue, number> = { alto: 0, medio: 0, bajo: 0 }

export function useAlertInboxController({
  pageSize = DEFAULT_PAGE_SIZE,
  withTotals = false,
}: { pageSize?: number; withTotals?: boolean } = {}) {
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<InboxKind | 'all'>('all')
  const [level, setLevel] = useState<RiskLevelValue | 'all'>('all')
  const { page, limit, setPage, reset } = usePagination(pageSize)

  const filters: InboxFilters = {
    status: 'open',
    kind: kind === 'all' ? undefined : kind,
    level: level === 'all' ? undefined : level,
    page,
    limit,
  }
  const inboxKey = queryKeys.alerts.inbox(filters)

  const inboxQuery = useQuery({
    queryKey: inboxKey,
    queryFn: () => healthService.listInboxPage(filters),
    placeholderData: keepPreviousData,
  })
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
      const current = queryClient.getQueryData<InboxPage>(inboxKey)
      if (current) queryClient.setQueryData(inboxKey, withoutItem(current, item))
      if (current && current.items.length === 1 && page > 1) setPage(page - 1)
      await refresh()
      toast.success(
        `${ITEM_NOUNS[item.kind]} de ${item.athleteName} ${DECISION_MESSAGES[status]}.`,
        { action: { label: 'Deshacer', onClick: () => undo.mutate(item) } },
      )
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const data = inboxQuery.data
  const counts = data?.counts

  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    setPage,
    totalOpen: counts?.total ?? 0,
    kindCounts: {
      all: counts?.total ?? 0,
      fatigue: counts?.byKind.fatigue ?? 0,
      risk: counts?.byKind.risk ?? 0,
    } satisfies Record<InboxKind | 'all', number>,
    levelCounts: counts?.byLevel ?? EMPTY_LEVELS,
    reviewTotals: totalsQuery.data,
    kind,
    setKind: (value: InboxKind | 'all') => {
      setKind(value)
      reset()
    },
    level,
    setLevel: (value: RiskLevelValue | 'all') => {
      setLevel(value)
      reset()
    },
    isLoading: inboxQuery.isPending,
    isChangingPage: inboxQuery.isPlaceholderData,
    errorMessage: inboxQuery.isError ? parseApiError(inboxQuery.error) : undefined,
    retry: () => void inboxQuery.refetch(),
    decide: (item: InboxItem, status: ReviewDecision['status']) => review.mutate({ item, status }),
    pendingKey: review.isPending ? review.variables?.item.key : undefined,
    athletePath: (item: InboxItem) => `${APP_MODULES.athletes.path}/${item.id_user}?tab=carga`,
  }
}
