import type { QueryParams } from '@/lib/listRequest'

export const queryKeys = {
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    athletes: () => [...queryKeys.users.all, 'athletes'] as const,
    athleteSearch: (filters: QueryParams) =>
      [...queryKeys.users.all, 'athletes', 'search', filters] as const,
  },
  seasons: {
    all: ['seasons'] as const,
    list: () => [...queryKeys.seasons.all, 'list'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  assignments: {
    all: ['athletes-in-categories'] as const,
    mine: () => [...queryKeys.assignments.all, 'me'] as const,
    list: (filters: QueryParams) => [...queryKeys.assignments.all, 'list', filters] as const,
  },
  weightProfiles: {
    all: ['position-weight-profiles'] as const,
    list: () => [...queryKeys.weightProfiles.all, 'list'] as const,
  },
  parentalConsents: {
    all: ['parental-consents'] as const,
    list: (filters: QueryParams) => [...queryKeys.parentalConsents.all, 'list', filters] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    openCount: () => [...queryKeys.alerts.all, 'open-count'] as const,
  },
}
