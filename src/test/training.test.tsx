import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { authService } from '@/services/authService'
import { competitionService } from '@/services/competitionService'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { trainingService } from '@/services/trainingService'
import { usersService } from '@/services/usersService'
import { createApiError } from '@/test/apiErrors'
import { ACTIVE_SEASON, SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type { TrainingSession } from '@/types/training'
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
vi.mock('@/services/competitionService', () => ({
  competitionService: {
    listCompetencies: vi.fn(),
    listAllMatches: vi.fn(),
    listCallUps: vi.fn(),
  },
}))
vi.mock('@/services/loadMonitoringService', () => ({
  loadMonitoringService: { athleteSeries: vi.fn(), listTrainingLoads: vi.fn() },
}))
vi.mock('@/services/trainingService', () => ({
  trainingService: {
    listSessions: vi.fn(),
    listAllSessions: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    removeSession: vi.fn(),
    listSessionLoads: vi.fn(),
    listUserLoads: vi.fn(),
    createLoad: vi.fn(),
    updateLoad: vi.fn(),
    listMatchStatistics: vi.fn(),
    createMatchStatistic: vi.fn(),
    updateMatchStatistic: vi.fn(),
    categoryAcwr: vi.fn(),
  },
}))

const TODAY_SESSION: TrainingSession = {
  id_session: 9,
  id_category: SUB15.id_category,
  category_name: SUB15.name,
  id_season: ACTIVE_SEASON.id_season,
  date: todayApiDate(),
  type: 'fisico',
  planned_duration_min: 90,
}

const SECOND_ATHLETE = {
  id_ath_cat: 31,
  id_user: 8,
  id_category: SUB15.id_category,
  category_name: SUB15.name,
  name: 'Bruno',
  lastname: 'Díaz',
  id_season: ACTIVE_SEASON.id_season,
  position: 'Delantero',
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

function rowOf(name: string): HTMLElement {
  const row = screen.getByText(name).closest('li')
  if (!row) throw new Error(`No existe la fila de ${name}`)
  return row
}

beforeAll(async () => {
  await import('@/views/app/training/TrainingView')
})

beforeEach(() => {
  primeAppDataMocks()
  vi.mocked(athleteAssignmentsService.listAll).mockResolvedValue([
    {
      id_ath_cat: 30,
      id_user: ATHLETE_USER.id_user,
      id_category: SUB15.id_category,
      category_name: SUB15.name,
      name: ATHLETE_USER.name,
      lastname: ATHLETE_USER.lastname,
      id_season: ACTIVE_SEASON.id_season,
      position: 'Portero',
    },
    SECOND_ATHLETE,
  ])
  vi.mocked(trainingService.listSessions).mockResolvedValue({
    items: [TODAY_SESSION],
    pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
  })
  vi.mocked(trainingService.listAllSessions).mockResolvedValue([TODAY_SESSION])
  vi.mocked(trainingService.listSessionLoads).mockResolvedValue([
    { id_load: 50, id_session: 9, id_user: 8, rpe: 6, duration_min: 80, session_load: 480 },
  ])
  vi.mocked(trainingService.listUserLoads).mockResolvedValue([])
  vi.mocked(trainingService.updateLoad).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
  vi.mocked(trainingService.createLoad).mockImplementation(async (payload) => ({
    ...payload,
    id_load: 99,
    session_load: payload.rpe * payload.duration_min,
  }))
  vi.mocked(competitionService.listCompetencies).mockResolvedValue([])
  vi.mocked(competitionService.listAllMatches).mockResolvedValue([])
  vi.mocked(loadMonitoringService.athleteSeries).mockResolvedValue({
    thresholds: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
    series: [],
  })
})

describe('registro rápido de RPE', () => {
  it('crea las cargas nuevas y actualiza las existentes con un solo Guardar todo', async () => {
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/entrenamiento')

    await user.click(await screen.findByRole('button', { name: 'Registrar RPE' }))
    const sheet = await screen.findByRole('dialog', { name: /Registrar RPE/ })
    await within(sheet).findByText('Ana María Pérez')

    await user.click(within(rowOf('Ana María Pérez')).getByRole('radio', { name: '7: Muy duro' }))
    expect(
      within(rowOf('Ana María Pérez')).getByText('RPE 7 × 90 min = 630 UA'),
    ).toBeInTheDocument()
    await user.click(within(rowOf('Bruno Díaz')).getByRole('radio', { name: '8: Muy duro +' }))
    await user.click(within(sheet).getByRole('button', { name: /Guardar todo/ }))

    await waitFor(() =>
      expect(trainingService.createLoad).toHaveBeenCalledWith({
        id_session: 9,
        id_user: ATHLETE_USER.id_user,
        rpe: 7,
        duration_min: 90,
      }),
    )
    expect(trainingService.updateLoad).toHaveBeenCalledWith(50, {
      id_session: 9,
      id_user: 8,
      rpe: 8,
      duration_min: 80,
    })
    expect(await screen.findByText('Guardamos 2 registros de RPE.')).toBeInTheDocument()
  })

  it('no envía a quien no asistió y muestra el error en la fila que falló', async () => {
    vi.mocked(trainingService.listSessionLoads).mockResolvedValue([])
    vi.mocked(trainingService.createLoad).mockRejectedValue(
      createApiError(400, { status: 'Error', mensaje: 'No existe el deportista indicado' }),
    )
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/entrenamiento')

    await user.click(await screen.findByRole('button', { name: 'Registrar RPE' }))
    const sheet = await screen.findByRole('dialog', { name: /Registrar RPE/ })
    await within(sheet).findByText('Ana María Pérez')

    await user.click(within(rowOf('Ana María Pérez')).getByRole('radio', { name: '5: Duro' }))
    await user.click(within(rowOf('Bruno Díaz')).getByRole('radio', { name: '9: Muy, muy duro' }))
    await user.click(within(rowOf('Bruno Díaz')).getByRole('button', { name: 'No asistió' }))
    await user.click(within(sheet).getByRole('button', { name: /Guardar todo/ }))

    expect(
      await within(rowOf('Ana María Pérez')).findByText('No existe el deportista indicado'),
    ).toBeInTheDocument()
    expect(trainingService.createLoad).toHaveBeenCalledTimes(1)
    expect(trainingService.createLoad).toHaveBeenCalledWith({
      id_session: 9,
      id_user: ATHLETE_USER.id_user,
      rpe: 5,
      duration_min: 90,
    })
  })
})

describe('vistas de entrenamiento por rol', () => {
  it('muestra al encargado de salud solo la carga del equipo', async () => {
    signInAs({ ...COACH_USER, id_user: 11, id_role: 5, role_name: 'ENCARGADO_SALUD' })
    vi.mocked(trainingService.categoryAcwr).mockResolvedValue({
      category: { id_category: SUB15.id_category, name: SUB15.name },
      season: { id_season: ACTIVE_SEASON.id_season, name: ACTIVE_SEASON.name },
      date: todayApiDate(),
      thresholds: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
      athletes: [],
    })
    renderAppAt('/app/entrenamiento')

    const tabList = await screen.findByRole('tablist', { name: 'Secciones de entrenamiento' })
    expect(
      within(tabList)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual(['Carga del equipo'])
  })

  it('permite al deportista reportar su RPE de hoy', async () => {
    vi.mocked(athleteAssignmentsService.getMine).mockResolvedValue({
      id_ath_cat: 30,
      id_user: ATHLETE_USER.id_user,
      id_category: SUB15.id_category,
      category_name: SUB15.name,
    })
    signInAs(ATHLETE_USER)
    const user = userEvent.setup()
    renderAppAt('/app/entrenamiento')

    expect(await screen.findByRole('heading', { name: 'Mi entrenamiento' })).toBeInTheDocument()
    await user.click(await screen.findByRole('radio', { name: '6: Duro +' }))
    await user.click(screen.getByRole('button', { name: 'Guardar mi RPE' }))

    await waitFor(() =>
      expect(trainingService.createLoad).toHaveBeenCalledWith({
        id_session: 9,
        id_user: ATHLETE_USER.id_user,
        rpe: 6,
        duration_min: 90,
      }),
    )
  })
})
