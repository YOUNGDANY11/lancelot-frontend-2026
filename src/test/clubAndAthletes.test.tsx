import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { authService } from '@/services/authService'
import { categoriesService } from '@/services/categoriesService'
import { competitionService } from '@/services/competitionService'
import { evaluationsService } from '@/services/evaluationsService'
import { healthService } from '@/services/healthService'
import { loadMonitoringService } from '@/services/loadMonitoringService'
import { objectivesService } from '@/services/objectivesService'
import { reportsService } from '@/services/reportsService'
import { seasonsService } from '@/services/seasonsService'
import { usersService } from '@/services/usersService'
import { ACTIVE_SEASON, SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type { User } from '@/types/user'
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
    createCompetency: vi.fn(),
    updateCompetency: vi.fn(),
    removeCompetency: vi.fn(),
    listAllMatches: vi.fn(),
    listMatches: vi.fn(),
    createMatch: vi.fn(),
    updateMatch: vi.fn(),
    removeMatch: vi.fn(),
    listCallUps: vi.fn(),
    createCallUp: vi.fn(),
    removeCallUp: vi.fn(),
  },
}))
vi.mock('@/services/evaluationsService', () => ({
  evaluationsService: {
    listPhysical: vi.fn(),
    createPhysical: vi.fn(),
    updatePhysical: vi.fn(),
    removePhysical: vi.fn(),
    listTechnical: vi.fn(),
    createTechnical: vi.fn(),
    updateTechnical: vi.fn(),
    removeTechnical: vi.fn(),
  },
}))
vi.mock('@/services/objectivesService', () => ({
  objectivesService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/loadMonitoringService', () => ({
  loadMonitoringService: { athleteSeries: vi.fn(), listTrainingLoads: vi.fn() },
}))
vi.mock('@/services/reportsService', () => ({
  reportsService: { seasonSummary: vi.fn(), seasonComparison: vi.fn() },
}))
vi.mock('@/services/healthService', () => ({
  healthService: { listInjuries: vi.fn(), listHealthRecords: vi.fn() },
}))

const HEALTH_USER: User = {
  id_user: 9,
  id_role: 5,
  name: 'Marta',
  lastname: 'Díaz',
  email: 'marta.diaz@club.com',
  birth_date: null,
  role_name: 'ENCARGADO_SALUD',
}

const SUB17 = { id_category: 5, name: 'Sub-17', min_age: 16, max_age: 17 }

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

beforeAll(async () => {
  await Promise.all([
    import('@/views/app/club/ClubView'),
    import('@/views/app/athletes/AthleteProfileView'),
  ])
})

beforeEach(() => {
  primeAppDataMocks({ categories: [SUB15, SUB17] })
  vi.mocked(usersService.listAllAthletes).mockResolvedValue([ATHLETE_USER])
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
  ])
  vi.mocked(competitionService.listCompetencies).mockResolvedValue([])
  vi.mocked(competitionService.listAllMatches).mockResolvedValue([])
  vi.mocked(evaluationsService.listPhysical).mockResolvedValue([])
  vi.mocked(evaluationsService.listTechnical).mockResolvedValue([])
  vi.mocked(objectivesService.list).mockResolvedValue([])
  vi.mocked(loadMonitoringService.athleteSeries).mockResolvedValue({
    thresholds: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
    series: [],
  })
  vi.mocked(loadMonitoringService.listTrainingLoads).mockResolvedValue({
    items: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  })
  vi.mocked(healthService.listInjuries).mockResolvedValue([])
  vi.mocked(healthService.listHealthRecords).mockResolvedValue([])
  vi.mocked(reportsService.seasonComparison).mockResolvedValue([])
  vi.mocked(athleteAssignmentsService.history).mockResolvedValue([])
})

describe('módulo Club', () => {
  it('pide confirmación antes de cerrar la temporada y explica la detección de talento', async () => {
    vi.mocked(seasonsService.update).mockResolvedValue({ ...ACTIVE_SEASON, status: 'closed' })
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=temporadas')

    await user.click(
      await screen.findByRole('button', { name: `Más acciones para ${ACTIVE_SEASON.name}` }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Cerrar temporada' }))

    const confirm = await screen.findByRole('alertdialog')
    expect(within(confirm).getByText(/detección automática de talento/)).toBeInTheDocument()
    await user.click(within(confirm).getByRole('button', { name: 'Cerrar temporada' }))

    await waitFor(() =>
      expect(seasonsService.update).toHaveBeenCalledWith(ACTIVE_SEASON.id_season, {
        status: 'closed',
      }),
    )
  })

  it('no le ofrece al entrenador crear temporadas, pero sí categorías', async () => {
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=temporadas')

    const table = await screen.findByRole('table', { name: 'Temporadas' })
    expect(within(table).getByText(ACTIVE_SEASON.name)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Crear temporada' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Categorías' }))
    expect(await screen.findByRole('button', { name: 'Crear categoría' })).toBeInTheDocument()
  })

  it('agrega a un deportista a otra categoría solo si su edad lo permite', async () => {
    vi.mocked(categoriesService.listAll).mockResolvedValue([
      { id_category: 3, name: 'Sub-13', min_age: 12, max_age: 13 },
      SUB15,
      SUB17,
    ])
    vi.mocked(athleteAssignmentsService.create).mockResolvedValue({
      status: 'Success',
      mensaje: 'ok',
    })
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=plantilla')

    await user.click(await screen.findByRole('button', { name: 'Asignar deportista' }))
    const dialog = await screen.findByRole('dialog', { name: /Agregar deportista a una categoría/ })
    const picker = within(dialog).getByRole('combobox', { name: 'Deportista' })
    await waitFor(() => expect(picker).toBeEnabled())
    await user.click(picker)
    await user.click(await within(dialog).findByRole('option', { name: /Ana María Pérez/ }))

    expect(within(dialog).getByText(/Tiene 15 años en 2026/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('combobox', { name: 'Categoría' }))
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      'Sub-17 (categoría superior)',
    ])
    await user.click(screen.getByRole('option', { name: 'Sub-17 (categoría superior)' }))
    await user.click(within(dialog).getByRole('button', { name: 'Asignar' }))

    await waitFor(() =>
      expect(athleteAssignmentsService.create).toHaveBeenCalledWith({
        id_user: ATHLETE_USER.id_user,
        id_category: SUB17.id_category,
        id_season: ACTIVE_SEASON.id_season,
        position: 'Portero',
      }),
    )
  })

  it('cambia de categoría a un deportista conservando su historial', async () => {
    vi.mocked(athleteAssignmentsService.update).mockResolvedValue({
      status: 'Success',
      mensaje: 'ok',
    })
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=plantilla')

    await user.click(
      await screen.findByRole('button', { name: 'Más acciones para Ana María Pérez' }),
    )
    await user.click(await screen.findByRole('menuitem', { name: 'Cambiar de categoría' }))

    const dialog = await screen.findByRole('dialog', {
      name: /Cambiar de categoría a Ana María Pérez/,
    })
    expect(within(dialog).getByText(/se conservan en la ficha/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('combobox', { name: 'Nueva categoría' }))
    await user.click(await screen.findByRole('option', { name: 'Sub-17' }))
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(athleteAssignmentsService.update).toHaveBeenCalledWith(30, {
        id_category: 5,
        position: 'Portero',
      }),
    )
  })
})

describe('módulo Deportistas', () => {
  it('lleva al deportista directo a su propia ficha', async () => {
    signInAs(ATHLETE_USER)
    const { router } = renderAppAt('/app/deportistas')

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/app/deportistas/${ATHLETE_USER.id_user}`),
    )
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ana María Pérez' }),
    ).toBeInTheDocument()
  })

  it('impide al deportista abrir la ficha de otra persona', async () => {
    signInAs(ATHLETE_USER)
    const { router } = renderAppAt('/app/deportistas/99')

    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })

  it('muestra al encargado de salud solo las pestañas de Carga y Salud', async () => {
    signInAs(HEALTH_USER)
    renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}`)

    const tabList = await screen.findByRole('tablist', { name: 'Secciones de la ficha' })
    expect(
      within(tabList)
        .getAllByRole('tab')
        .map((tab) => tab.textContent),
    ).toEqual(['Carga', 'Salud'])
  })

  it('busca deportistas en el directorio', async () => {
    vi.mocked(usersService.listAllAthletes).mockResolvedValue([
      ATHLETE_USER,
      { ...ATHLETE_USER, id_user: 8, name: 'José', lastname: 'Gómez', email: 'jose@club.com' },
    ])
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/deportistas')

    await screen.findByText('Ana María Pérez')
    await user.type(screen.getByRole('searchbox', { name: 'Buscar deportistas' }), 'jose')

    await waitFor(() => expect(screen.queryByText('Ana María Pérez')).not.toBeInTheDocument())
    expect(screen.getByText('José Gómez')).toBeInTheDocument()
  })
})
