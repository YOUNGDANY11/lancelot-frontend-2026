import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { authService } from '@/services/authService'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { objectivesService } from '@/services/objectivesService'
import { reportsService } from '@/services/reportsService'
import { trainingService } from '@/services/trainingService'
import { usersService } from '@/services/usersService'
import { ACTIVE_SEASON, SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { ATHLETE_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type { AcwrSeriesPoint } from '@/types/athlete'
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
  weightProfilesService: { listAll: vi.fn(), count: vi.fn(), create: vi.fn() },
}))
vi.mock('@/services/parentalConsentsService', () => ({
  parentalConsentsService: { listAll: vi.fn(), create: vi.fn() },
}))
vi.mock('@/services/trainingService', () => ({
  trainingService: {
    listAllSessions: vi.fn(),
    listUserLoads: vi.fn(),
    createLoad: vi.fn(),
    updateLoad: vi.fn(),
  },
}))
vi.mock('@/services/loadMonitoringService', () => ({
  loadMonitoringService: { athleteSeries: vi.fn(), listTrainingLoads: vi.fn() },
}))
vi.mock('@/services/reportsService', () => ({
  reportsService: { seasonSummary: vi.fn(), seasonComparison: vi.fn() },
}))
vi.mock('@/services/objectivesService', () => ({
  objectivesService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const SERIES: AcwrSeriesPoint[] = Array.from({ length: 14 }, (_, index) => ({
  date: `2026-09-${String(index + 10).padStart(2, '0')}`,
  daily_load: 400,
  sessions: 1,
  acute_load: 380,
  chronic_load: 320,
  acwr: 1.1,
  level: 'bajo',
}))

beforeAll(async () => {
  await Promise.all([
    import('@/views/app/home/HomeView'),
    import('@/components/modules/home/AthleteHome'),
  ])
})

beforeEach(() => {
  primeAppDataMocks()
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(ATHLETE_USER)
  vi.mocked(athleteAssignmentsService.getMine).mockResolvedValue([
    {
      id_ath_cat: 30,
      id_user: ATHLETE_USER.id_user,
      id_category: SUB15.id_category,
      category_name: SUB15.name,
      id_season: ACTIVE_SEASON.id_season,
      position: 'Portero',
    },
  ])
  vi.mocked(athleteAssignmentsService.history).mockResolvedValue([])
  vi.mocked(trainingService.listAllSessions).mockResolvedValue([
    {
      id_session: 9,
      id_category: SUB15.id_category,
      category_name: SUB15.name,
      id_season: ACTIVE_SEASON.id_season,
      date: todayApiDate(),
      type: 'tecnico',
      planned_duration_min: 75,
    },
  ])
  vi.mocked(trainingService.listUserLoads).mockResolvedValue([])
  vi.mocked(trainingService.createLoad).mockImplementation(async (payload) => ({
    ...payload,
    id_load: 70,
    session_load: payload.rpe * payload.duration_min,
  }))
  vi.mocked(loadMonitoringService.athleteSeries).mockResolvedValue({
    thresholds: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
    series: SERIES,
  })
  vi.mocked(reportsService.seasonComparison).mockResolvedValue([
    {
      id_season: 1,
      season_name: 'Temporada 2025',
      start_date: '2025-02-01',
      physical_score: 60,
      technical_score: 65,
      participation_score: 70,
      index_value: 64,
    },
    {
      id_season: ACTIVE_SEASON.id_season,
      season_name: ACTIVE_SEASON.name,
      start_date: ACTIVE_SEASON.start_date,
      physical_score: 70,
      technical_score: 75,
      participation_score: 80,
      index_value: 74.5,
    },
  ])
  vi.mocked(objectivesService.list).mockResolvedValue([])
})

describe('flujo del deportista', () => {
  it('reporta su RPE de hoy desde el inicio y ve su carga y su evolución', async () => {
    const user = userEvent.setup()
    renderAppAt('/app/inicio')

    const rpe = await screen.findByRole('region', { name: 'Reportar mi RPE de hoy' })
    await user.click(await within(rpe).findByRole('radio', { name: '7: Muy duro' }))
    expect(within(rpe).getByText('RPE 7 × 75 min = 525 UA')).toBeInTheDocument()
    await user.click(within(rpe).getByRole('button', { name: 'Guardar mi RPE' }))

    await waitFor(() =>
      expect(trainingService.createLoad).toHaveBeenCalledWith({
        id_session: 9,
        id_user: ATHLETE_USER.id_user,
        rpe: 7,
        duration_min: 75,
      }),
    )
    expect(await screen.findByText('Mi ACWR de las últimas 6 semanas')).toBeInTheDocument()
    expect(await screen.findByText('Comparación entre temporadas')).toBeInTheDocument()
    expect(reportsService.seasonComparison).toHaveBeenCalledWith(ATHLETE_USER.id_user)
    expect(
      within(screen.getByRole('region', { name: 'Mi categoría' })).getByText(SUB15.name),
    ).toBeInTheDocument()
  })
})
