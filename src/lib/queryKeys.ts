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
  competencies: {
    all: ['competencies'] as const,
    list: (idSeason: number | undefined) =>
      [...queryKeys.competencies.all, 'list', idSeason] as const,
  },
  matches: {
    all: ['matches'] as const,
    list: (filters: QueryParams) => [...queryKeys.matches.all, 'list', filters] as const,
  },
  callUps: {
    all: ['athletes-in-competencies'] as const,
    list: (idCompetency: number) => [...queryKeys.callUps.all, 'list', idCompetency] as const,
  },
  assignments: {
    all: ['athletes-in-categories'] as const,
    mine: () => [...queryKeys.assignments.all, 'me'] as const,
    list: (filters: QueryParams) => [...queryKeys.assignments.all, 'list', filters] as const,
    history: (idUser: number) => [...queryKeys.assignments.all, 'history', idUser] as const,
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
  athlete: {
    all: (idUser: number) => ['athlete', idUser] as const,
    physical: (idUser: number) => [...queryKeys.athlete.all(idUser), 'physical'] as const,
    technical: (idUser: number) => [...queryKeys.athlete.all(idUser), 'technical'] as const,
    objectives: (idUser: number) => [...queryKeys.athlete.all(idUser), 'objectives'] as const,
    acwr: (idUser: number, range: string) =>
      [...queryKeys.athlete.all(idUser), 'acwr', range] as const,
    loads: (idUser: number, page: number) =>
      [...queryKeys.athlete.all(idUser), 'loads', page] as const,
    summary: (idUser: number, idSeason: number) =>
      [...queryKeys.athlete.all(idUser), 'summary', idSeason] as const,
    comparison: (idUser: number) => [...queryKeys.athlete.all(idUser), 'comparison'] as const,
    injuries: (idUser: number) => [...queryKeys.athlete.all(idUser), 'injuries'] as const,
    healthRecords: (idUser: number) =>
      [...queryKeys.athlete.all(idUser), 'health-records'] as const,
    consents: (idUser: number) => [...queryKeys.athlete.all(idUser), 'consents'] as const,
  },
}
