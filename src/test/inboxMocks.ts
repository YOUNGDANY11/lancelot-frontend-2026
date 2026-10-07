import { vi } from 'vitest'
import { LEVEL_PRIORITY } from '@/constants/health'
import { healthService, type InboxFilters } from '@/services/healthService'
import type { InboxItem, InboxPage } from '@/types/health'

export function inboxItem(
  overrides: Partial<InboxItem> & Pick<InboxItem, 'kind' | 'id'>,
): InboxItem {
  return {
    key: `${overrides.kind}-${overrides.id}`,
    id_user: 7,
    athleteName: 'Ana María Pérez',
    level: 'medio',
    date: '2026-10-04',
    acwr: null,
    acuteLoad: null,
    chronicLoad: null,
    rpeAvg: null,
    rules: [],
    details: null,
    method: null,
    ...overrides,
  }
}

export function inboxPageOf(items: InboxItem[], filters: InboxFilters = {}): InboxPage {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 10
  const sorted = [...items].sort(
    (first, second) =>
      LEVEL_PRIORITY[first.level] - LEVEL_PRIORITY[second.level] ||
      second.date.localeCompare(first.date) ||
      first.athleteName.localeCompare(second.athleteName, 'es'),
  )
  const matching = sorted.filter(
    (item) =>
      (!filters.kind || item.kind === filters.kind) &&
      (!filters.level || item.level === filters.level),
  )
  const count = (predicate: (item: InboxItem) => boolean) => items.filter(predicate).length
  return {
    items: matching.slice((page - 1) * limit, page * limit),
    pagination: {
      total: matching.length,
      page,
      limit,
      totalPages: Math.ceil(matching.length / limit),
    },
    counts: {
      total: items.length,
      byKind: {
        fatigue: count((item) => item.kind === 'fatigue'),
        risk: count((item) => item.kind === 'risk'),
      },
      byLevel: {
        alto: count((item) => item.level === 'alto'),
        medio: count((item) => item.level === 'medio'),
        bajo: count((item) => item.level === 'bajo'),
      },
    },
  }
}

export function mockOpenInbox(items: InboxItem[]) {
  vi.mocked(healthService.listInboxPage).mockImplementation(async (filters) =>
    inboxPageOf(items, filters),
  )
  vi.mocked(healthService.listOpenInbox).mockResolvedValue(items)
}
