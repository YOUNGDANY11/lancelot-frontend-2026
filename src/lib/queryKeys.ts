import type { QueryParams } from '@/lib/listRequest'

export const queryKeys = {
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    athletes: () => [...queryKeys.users.all, 'athletes'] as const,
    page: (filters: QueryParams) => [...queryKeys.users.all, 'page', filters] as const,
    athleteSearch: (filters: QueryParams) =>
      [...queryKeys.users.all, 'athletes', 'search', filters] as const,
    athleteCount: (filters: QueryParams) =>
      [...queryKeys.users.all, 'athletes', 'count', filters] as const,
  },
  seasons: {
    all: ['seasons'] as const,
    list: () => [...queryKeys.seasons.all, 'list'] as const,
    page: (filters: QueryParams) => [...queryKeys.seasons.all, 'page', filters] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    page: (filters: QueryParams) => [...queryKeys.categories.all, 'page', filters] as const,
  },
  competencies: {
    all: ['competencies'] as const,
    list: (idSeason: number | undefined) =>
      [...queryKeys.competencies.all, 'list', idSeason] as const,
    page: (filters: QueryParams) => [...queryKeys.competencies.all, 'page', filters] as const,
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
    page: (filters: QueryParams) => [...queryKeys.weightProfiles.all, 'page', filters] as const,
  },
  parentalConsents: {
    all: ['parental-consents'] as const,
    list: (filters: QueryParams) => [...queryKeys.parentalConsents.all, 'list', filters] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    openCount: () => [...queryKeys.alerts.all, 'open-count'] as const,
    inbox: (filters: QueryParams) => [...queryKeys.alerts.all, 'inbox', filters] as const,
    openItems: () => [...queryKeys.alerts.all, 'open-items'] as const,
    reviewTotals: () => [...queryKeys.alerts.all, 'review-totals'] as const,
  },
  talent: {
    all: ['talent'] as const,
    ranking: (filters: QueryParams) => [...queryKeys.talent.all, 'ranking', filters] as const,
    flags: (filters: QueryParams) => [...queryKeys.talent.all, 'flags', filters] as const,
    flagCount: (filters: QueryParams) => [...queryKeys.talent.all, 'flag-count', filters] as const,
    categoryEvolution: (idCategory: number) =>
      [...queryKeys.talent.all, 'category-evolution', idCategory] as const,
    categoryEvolutionPage: (idCategory: number, page: number) =>
      [...queryKeys.talent.all, 'category-evolution', idCategory, 'page', page] as const,
    plan: (idSeason: number, idTarget: number | null, page = 1) =>
      [...queryKeys.talent.all, 'plan', idSeason, idTarget, page] as const,
  },
  ml: {
    all: ['ml'] as const,
    engine: () => [...queryKeys.ml.all, 'engine'] as const,
    readiness: () => [...queryKeys.ml.all, 'readiness'] as const,
    talentReadiness: () => [...queryKeys.ml.all, 'talent-readiness'] as const,
    dataQuality: (range: QueryParams) => [...queryKeys.ml.all, 'data-quality', range] as const,
    models: (filters: QueryParams) => [...queryKeys.ml.all, 'models', filters] as const,
    features: (filters: QueryParams) => [...queryKeys.ml.all, 'features', filters] as const,
    validation: (range: QueryParams) => [...queryKeys.ml.all, 'validation', range] as const,
  },
  config: {
    all: (kind: string) => ['config', kind] as const,
    active: (kind: string, idCategory: number | null) =>
      [...queryKeys.config.all(kind), 'active', idCategory] as const,
    overrides: (kind: string) => [...queryKeys.config.all(kind), 'overrides'] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
    page: (filters: QueryParams) => [...queryKeys.roles.all, 'page', filters] as const,
  },
  health: {
    all: ['health'] as const,
    injuries: (filters: QueryParams) => [...queryKeys.health.all, 'injuries', filters] as const,
    injuryMechanism: () => [...queryKeys.health.all, 'injury-mechanism'] as const,
    missingMechanism: () => [...queryKeys.health.all, 'missing-mechanism'] as const,
    records: (filters: QueryParams) => [...queryKeys.health.all, 'records', filters] as const,
    audit: (filters: QueryParams) => [...queryKeys.health.all, 'audit', filters] as const,
  },
  training: {
    all: ['training'] as const,
    sessions: (filters: QueryParams) => [...queryKeys.training.all, 'sessions', filters] as const,
    sessionLoads: (idSession: number) =>
      [...queryKeys.training.all, 'session-loads', idSession] as const,
    matchStats: (idMatch: number) => [...queryKeys.training.all, 'match-stats', idMatch] as const,
    teamAcwr: (idCategory: number, date: string) =>
      [...queryKeys.training.all, 'team-acwr', idCategory, date] as const,
    teamAcwrPage: (idCategory: number, date: string, page: number) =>
      [...queryKeys.training.all, 'team-acwr', idCategory, date, 'page', page] as const,
    myLoads: (idUser: number) => [...queryKeys.training.all, 'my-loads', idUser] as const,
  },
  evaluationCatalog: () => ['evaluation-catalog'] as const,
  athlete: {
    root: ['athlete'] as const,
    all: (idUser: number) => ['athlete', idUser] as const,
    physical: (idUser: number) => [...queryKeys.athlete.all(idUser), 'physical'] as const,
    physicalPage: (idUser: number, page: number) =>
      [...queryKeys.athlete.all(idUser), 'physical', 'page', page] as const,
    technical: (idUser: number) => [...queryKeys.athlete.all(idUser), 'technical'] as const,
    technicalPage: (idUser: number, page: number) =>
      [...queryKeys.athlete.all(idUser), 'technical', 'page', page] as const,
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
