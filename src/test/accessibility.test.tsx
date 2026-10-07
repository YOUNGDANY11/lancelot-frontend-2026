import { screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertsService } from '@/services/alertsService'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { authService } from '@/services/authService'
import { competitionService } from '@/services/competitionService'
import { configService } from '@/services/configService'
import { evaluationsService } from '@/services/evaluationsService'
import { healthService } from '@/services/healthService'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { mlService } from '@/services/mlService'
import { objectivesService } from '@/services/objectivesService'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { reportsService } from '@/services/reportsService'
import { rolesService } from '@/services/rolesService'
import { talentService } from '@/services/talentService'
import { trainingService } from '@/services/trainingService'
import { usersService } from '@/services/usersService'
import { weightProfilesService } from '@/services/weightProfilesService'
import { ACTIVE_SEASON, SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { findAxeViolations } from '@/test/axe'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { inboxItem, mockOpenInbox } from '@/test/inboxMocks'
import { renderAppAt } from '@/test/renderWithProviders'
import type { User } from '@/types/user'
import { todayApiDate } from '@/utils/formatDate'
import { REFRESH_TOKEN_STORAGE_KEY } from '@/utils/tokenStorage'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshSession: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
  },
}))
vi.mock('@/services/usersService', () => ({
  usersService: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
    changeMyPassword: vi.fn(),
    listAll: vi.fn(),
    listAllAthletes: vi.fn(),
    searchAthletes: vi.fn(),
    createByAdmin: vi.fn(),
    updateByAdmin: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/seasonsService', () => ({
  seasonsService: { listAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/categoriesService', () => ({
  categoriesService: { listAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/athleteAssignmentsService', () => ({
  athleteAssignmentsService: {
    list: vi.fn(),
    listAll: vi.fn(),
    count: vi.fn(),
    getMine: vi.fn(),
    history: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/alertsService', () => ({ alertsService: { countOpen: vi.fn() } }))
vi.mock('@/services/weightProfilesService', () => ({
  weightProfilesService: {
    listAll: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/parentalConsentsService', () => ({
  parentalConsentsService: {
    listAll: vi.fn(),
    listPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/competitionService', () => ({
  competitionService: {
    listCompetencies: vi.fn(),
    listAllMatches: vi.fn(),
    listMatches: vi.fn(),
    listCallUps: vi.fn(),
  },
}))
vi.mock('@/services/trainingService', () => ({
  trainingService: {
    listSessions: vi.fn(),
    listAllSessions: vi.fn(),
    listSessionLoads: vi.fn(),
    listUserLoads: vi.fn(),
    listMatchStatistics: vi.fn(),
    categoryAcwr: vi.fn(),
  },
}))
vi.mock('@/services/healthService', () => ({
  healthService: {
    listInjuries: vi.fn(),
    listInjuriesPage: vi.fn(),
    listAllInjuries: vi.fn(),
    injuryMechanismTotals: vi.fn(),
    listHealthRecords: vi.fn(),
    listHealthRecordsPage: vi.fn(),
    listAuditLogs: vi.fn(),
    listInboxPage: vi.fn(),
    listOpenInbox: vi.fn(),
    reviewTotals: vi.fn(),
  },
}))
vi.mock('@/services/talentService', () => ({
  talentService: { listIndices: vi.fn(), listFlags: vi.fn(), countFlags: vi.fn() },
}))
vi.mock('@/services/mlService', () => ({
  mlService: {
    engineConfig: vi.fn(),
    readiness: vi.fn(),
    dataQuality: vi.fn(),
    listModels: vi.fn(),
    listFeatures: vi.fn(),
    validationReport: vi.fn(),
  },
}))
vi.mock('@/services/configService', () => ({
  configService: { getActive: vi.fn(), listOverrides: vi.fn() },
}))
vi.mock('@/services/rolesService', () => ({
  rolesService: { list: vi.fn(), idsByCode: vi.fn() },
  toRoleCode: (role: { name: string }) => role.name,
}))
vi.mock('@/services/evaluationsService', () => ({
  evaluationsService: { listPhysical: vi.fn(), listTechnical: vi.fn() },
}))
vi.mock('@/services/objectivesService', () => ({ objectivesService: { list: vi.fn() } }))
vi.mock('@/services/loadMonitoringService', () => ({
  loadMonitoringService: { athleteSeries: vi.fn(), listTrainingLoads: vi.fn() },
}))
vi.mock('@/services/reportsService', () => ({
  reportsService: { seasonSummary: vi.fn(), seasonComparison: vi.fn() },
}))

const DT_USER: User = { ...COACH_USER, id_user: 12, id_role: 4, role_name: 'DIRECTOR_TECNICO' }
const HEALTH_USER: User = { ...COACH_USER, id_user: 11, id_role: 5, role_name: 'ENCARGADO_SALUD' }
const EMPTY_PAGE = { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }
const THRESHOLDS = { low_min: 0.8, low_max: 1.3, medium_max: 1.5 }
const ASSIGNMENT = {
  id_ath_cat: 30,
  id_user: ATHLETE_USER.id_user,
  id_category: SUB15.id_category,
  category_name: SUB15.name,
  name: ATHLETE_USER.name,
  lastname: ATHLETE_USER.lastname,
  id_season: ACTIVE_SEASON.id_season,
  position: 'Portero',
}
const SESSION = {
  id_session: 9,
  id_category: SUB15.id_category,
  category_name: SUB15.name,
  id_season: ACTIVE_SEASON.id_season,
  date: todayApiDate(),
  type: 'fisico' as const,
  planned_duration_min: 90,
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

beforeAll(async () => {
  await Promise.all([
    import('@/views/landing/LandingView'),
    import('@/views/app/home/HomeView'),
    import('@/components/modules/home/AdminHome'),
    import('@/components/modules/home/CoachHome'),
    import('@/components/modules/home/HealthHome'),
    import('@/components/modules/home/AthleteHome'),
    import('@/views/app/club/ClubView'),
    import('@/views/app/athletes/AthleteDirectoryView'),
    import('@/views/app/athletes/AthleteProfileView'),
    import('@/views/app/training/TrainingView'),
    import('@/views/app/health/HealthView'),
    import('@/views/app/talent/TalentView'),
    import('@/views/app/analytics/AnalyticsView'),
    import('@/views/app/settings/SettingsView'),
  ])
})

beforeEach(() => {
  primeAppDataMocks()
  vi.mocked(alertsService.countOpen).mockResolvedValue({ fatigue: 1, risk: 0, total: 1 })
  vi.mocked(athleteAssignmentsService.listAll).mockResolvedValue([ASSIGNMENT])
  vi.mocked(athleteAssignmentsService.list).mockResolvedValue({
    ...EMPTY_PAGE,
    items: [ASSIGNMENT],
  })
  vi.mocked(athleteAssignmentsService.history).mockResolvedValue([])
  vi.mocked(usersService.listAll).mockResolvedValue([ADMIN_USER, COACH_USER, ATHLETE_USER])
  vi.mocked(usersService.listAllAthletes).mockResolvedValue([ATHLETE_USER])
  vi.mocked(weightProfilesService.listAll).mockResolvedValue([])
  vi.mocked(parentalConsentsService.listPage).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(competitionService.listCompetencies).mockResolvedValue([])
  vi.mocked(competitionService.listAllMatches).mockResolvedValue([])
  vi.mocked(competitionService.listMatches).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(trainingService.listSessions).mockResolvedValue({
    items: [SESSION],
    pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
  })
  vi.mocked(trainingService.listAllSessions).mockResolvedValue([SESSION])
  vi.mocked(trainingService.listUserLoads).mockResolvedValue([])
  vi.mocked(trainingService.categoryAcwr).mockResolvedValue({
    category: { id_category: SUB15.id_category, name: SUB15.name },
    season: { id_season: ACTIVE_SEASON.id_season, name: ACTIVE_SEASON.name },
    date: todayApiDate(),
    thresholds: THRESHOLDS,
    athletes: [
      {
        id_user: ATHLETE_USER.id_user,
        name: ATHLETE_USER.name,
        lastname: ATHLETE_USER.lastname,
        position: 'Portero',
        daily_load: 400,
        acute_load: 350,
        chronic_load: 330,
        acwr: 1.06,
        level: 'bajo',
        sessions_7d: 4,
      },
    ],
  })
  mockOpenInbox([
    inboxItem({
      kind: 'fatigue',
      id: 1,
      id_user: ATHLETE_USER.id_user,
      athleteName: 'Ana María Pérez',
      date: todayApiDate(),
      acuteLoad: 520,
      chronicLoad: 340,
      acwr: 1.53,
      rpeAvg: 7.2,
      level: 'medio',
    }),
  ])
  vi.mocked(healthService.reviewTotals).mockResolvedValue({ reviewed: 1, dismissed: 0 })
  vi.mocked(healthService.listAllInjuries).mockResolvedValue([])
  vi.mocked(healthService.listInjuriesPage).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(healthService.injuryMechanismTotals).mockResolvedValue({
    total: 0,
    contact: 0,
    nonContact: 0,
    missing: 0,
  })
  vi.mocked(talentService.listIndices).mockResolvedValue([])
  vi.mocked(talentService.listFlags).mockResolvedValue([])
  vi.mocked(talentService.countFlags).mockResolvedValue(0)
  vi.mocked(mlService.engineConfig).mockResolvedValue({
    id_config: 1,
    engine: 'rules',
    min_labeled_days: 180,
    min_non_contact_injuries: 15,
    min_athletes: 20,
    prob_medium_threshold: 0.25,
    prob_high_threshold: 0.5,
  })
  vi.mocked(mlService.readiness).mockResolvedValue({
    ready: false,
    criteria: [
      {
        code: 'dias_etiquetados',
        descripcion: 'Días etiquetados',
        value: 40,
        minimum: 180,
        met: false,
      },
    ],
    labeled_rows: 300,
    positive_labels: 2,
    labeled_period: { from: '2026-08-01', to: '2026-09-10' },
  })
  vi.mocked(mlService.dataQuality).mockResolvedValue({
    period: { from: '2026-09-07', to: '2026-10-04', days: 28 },
    snapshots: { rows: 120, days_with_snapshot: 28, athletes_with_data: 18 },
    injuries: { total: 4, without_mechanism: 1, without_mechanism_pct: 25 },
    matches: { total: 3, without_rpe: 0, without_rpe_pct: 0 },
    load_days: { avg_days_without_load_pct: 40.5 },
    warnings: [],
  })
  vi.mocked(mlService.listModels).mockResolvedValue([])
  vi.mocked(configService.getActive).mockResolvedValue({
    id: 1,
    id_category: null,
    scope: 'global',
    values: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
  })
  vi.mocked(configService.listOverrides).mockResolvedValue([])
  vi.mocked(rolesService.list).mockResolvedValue([])
  vi.mocked(evaluationsService.listPhysical).mockResolvedValue([])
  vi.mocked(evaluationsService.listTechnical).mockResolvedValue([])
  vi.mocked(objectivesService.list).mockResolvedValue([])
  vi.mocked(loadMonitoringService.athleteSeries).mockResolvedValue({
    thresholds: THRESHOLDS,
    series: [],
  })
  vi.mocked(loadMonitoringService.listTrainingLoads).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(reportsService.seasonComparison).mockResolvedValue([])
})

async function expectNoViolations(heading: string | RegExp) {
  await screen.findByRole('heading', { level: 1, name: heading })
  await waitFor(() => expect(document.querySelectorAll('[data-slot=skeleton]')).toHaveLength(0))
  expect(await findAxeViolations()).toEqual([])
}

describe('accesibilidad de las pantallas principales', () => {
  it.each([
    ['administrador en el inicio', ADMIN_USER, '/app/inicio', /Hola/],
    ['encargado de salud en el inicio', HEALTH_USER, '/app/inicio', /Hola/],
    ['entrenador en el inicio', COACH_USER, '/app/inicio', /Hola/],
    ['entrenador en entrenamiento', COACH_USER, '/app/entrenamiento', 'Entrenamiento'],
    ['encargado de salud en salud', HEALTH_USER, '/app/salud', 'Salud'],
    ['director técnico en talento', DT_USER, '/app/talento', 'Talento y progreso'],
    ['director técnico en configuración', DT_USER, '/app/configuracion', 'Configuración'],
    ['encargado de salud en análisis', HEALTH_USER, '/app/analisis', 'Análisis IA'],
    ['administrador en club', ADMIN_USER, '/app/club', 'Club'],
    ['entrenador en el directorio', COACH_USER, '/app/deportistas', 'Deportistas'],
  ])('%s', async (_name, user, path, heading) => {
    signInAs(user)
    renderAppAt(path)
    await expectNoViolations(heading)
  })

  it('deportista en su inicio', async () => {
    vi.mocked(athleteAssignmentsService.getMine).mockResolvedValue([ASSIGNMENT])
    signInAs(ATHLETE_USER)
    renderAppAt('/app/inicio')
    await expectNoViolations(/Hola/)
  })

  it('landing pública', async () => {
    renderAppAt('/')
    await screen.findByRole('heading', { level: 1 })
    expect(await findAxeViolations()).toEqual([])
  })
})
