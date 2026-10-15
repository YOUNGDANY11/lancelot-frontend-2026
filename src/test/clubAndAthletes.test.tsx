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
    import('@/views/app/athletes/AthleteReportView'),
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

describe('informe de evolución individual', () => {
  const SUMMARY = {
    athlete: {
      id_user: ATHLETE_USER.id_user,
      name: 'Ana María',
      lastname: 'Pérez',
      position: 'Portero',
      category: SUB15.name,
    },
    season: { id_season: ACTIVE_SEASON.id_season, name: ACTIVE_SEASON.name },
    training_participation: {
      total_sessions: 20,
      sessions_attended: 18,
      attendance_rate: 90,
      avg_rpe: 6.4,
      total_session_load: 9200,
    },
    match_participation: {
      matches_in_season: 8,
      matches_played: 7,
      total_minutes: 540,
      goals: 2,
      assists: 3,
      yellow_cards: 1,
      red_cards: 0,
    },
    fatigue_alerts: [],
    injury_risk_assessments: [],
    weighted_progress_index: {
      id_index: 1,
      id_user: ATHLETE_USER.id_user,
      id_season: ACTIVE_SEASON.id_season,
      physical_score: 70,
      technical_score: 75.5,
      participation_score: 80,
      index_value: 74.5,
      warnings: ['Sin evaluación física de mitad de temporada'],
    },
  }

  it('reúne la evolución de la temporada en un informe imprimible', async () => {
    vi.mocked(reportsService.seasonSummary).mockResolvedValue(SUMMARY)
    vi.mocked(evaluationsService.listTechnical).mockResolvedValue([
      {
        id_eval_tech: 1,
        id_user: ATHLETE_USER.id_user,
        id_season: ACTIVE_SEASON.id_season,
        indicator: 'Pase corto',
        score: 7,
        evaluator_id: 2,
        eval_date: '2026-03-01',
      },
      {
        id_eval_tech: 2,
        id_user: ATHLETE_USER.id_user,
        id_season: ACTIVE_SEASON.id_season,
        indicator: 'Pase corto',
        score: 8,
        evaluator_id: 2,
        eval_date: '2026-05-01',
      },
    ])
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)
    signInAs(COACH_USER)
    const user = userEvent.setup()
    const { router } = renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}`)

    await user.click(await screen.findByRole('link', { name: 'Informe de evolución' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/app/deportistas/${ATHLETE_USER.id_user}/informe`,
      ),
    )
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ana María Pérez' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Informe de evolución individual')).toBeInTheDocument()
    expect(screen.getByText('74,5')).toBeInTheDocument()
    expect(screen.getByText('Sin evaluación física de mitad de temporada')).toBeInTheDocument()
    const technical = screen.getByRole('table', {
      name: 'Promedio por indicador de la evaluación técnica',
    })
    expect(within(technical).getByRole('row', { name: /Pase corto 7,5 2/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Imprimir o guardar en PDF' }))
    expect(print).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })

  it('no deja abrir el informe a roles sin acceso al resumen deportivo', async () => {
    signInAs(HEALTH_USER)
    const { router } = renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}/informe`)

    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})

describe('fútbol y fútbol sala', () => {
  const SALA = {
    id_category: 6,
    name: 'Sala Sub-17',
    min_age: 14,
    max_age: 17,
    sport: 'futbol_sala' as const,
  }

  it('crea una categoría indicando su deporte', async () => {
    vi.mocked(categoriesService.create).mockResolvedValue(SALA)
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=categorias')

    await user.click(await screen.findByRole('button', { name: 'Crear categoría' }))
    const dialog = await screen.findByRole('dialog', { name: 'Crear categoría' })
    await user.type(within(dialog).getByLabelText('Nombre'), 'Sala Sub-17')
    await user.type(within(dialog).getByLabelText('Edad mínima'), '14')
    await user.type(within(dialog).getByLabelText('Edad máxima'), '17')
    await user.click(within(dialog).getByRole('combobox', { name: 'Deporte' }))
    await user.click(await screen.findByRole('option', { name: 'Fútbol sala' }))
    await user.click(within(dialog).getByRole('button', { name: 'Crear categoría' }))

    await waitFor(() =>
      expect(categoriesService.create).toHaveBeenCalledWith({
        name: 'Sala Sub-17',
        min_age: 14,
        max_age: 17,
        sport: 'futbol_sala',
      }),
    )
  })

  it('ofrece solo las posiciones del deporte de la categoría elegida', async () => {
    vi.mocked(categoriesService.listAll).mockResolvedValue([SUB15, SALA])
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/club?tab=plantilla')

    await user.click(await screen.findByRole('button', { name: 'Asignar deportista' }))
    const dialog = await screen.findByRole('dialog', { name: /Agregar deportista a una categoría/ })
    const picker = within(dialog).getByRole('combobox', { name: 'Deportista' })
    await waitFor(() => expect(picker).toBeEnabled())
    await user.click(picker)
    await user.click(await within(dialog).findByRole('option', { name: /Ana María Pérez/ }))
    await user.click(within(dialog).getByRole('combobox', { name: 'Categoría' }))
    await user.click(await screen.findByRole('option', { name: /Sala Sub-17/ }))

    expect(within(dialog).getByRole('combobox', { name: 'Posición' })).toHaveTextContent(
      /Elige|Selecciona/,
    )
    await user.click(within(dialog).getByRole('combobox', { name: 'Posición' }))
    const options = (await screen.findAllByRole('option')).map((option) => option.textContent)
    expect(options).toEqual(['Portero de fútbol sala', 'Cierre', 'Ala', 'Pívot', 'Universal'])
  })

  it('separa las evaluaciones técnicas de las tácticas', async () => {
    vi.mocked(evaluationsService.listTechnical).mockResolvedValue([
      {
        id_eval_tech: 1,
        id_user: ATHLETE_USER.id_user,
        id_season: ACTIVE_SEASON.id_season,
        dimension: 'tecnica',
        indicator: 'Pase corto',
        score: 7,
        evaluator_id: 2,
        eval_date: '2026-03-01',
      },
      {
        id_eval_tech: 2,
        id_user: ATHLETE_USER.id_user,
        id_season: ACTIVE_SEASON.id_season,
        dimension: 'tactica',
        indicator: 'Presión alta',
        score: 8,
        evaluator_id: 2,
        eval_date: '2026-03-02',
      },
    ])
    vi.mocked(evaluationsService.createTechnical).mockResolvedValue({
      status: 'Success',
      mensaje: 'ok',
    })
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}?tab=tecnico`)

    const tactical = await screen.findByRole('heading', { level: 3, name: 'Táctica' })
    expect(within(tactical.parentElement as HTMLElement).getByText('Presión alta')).toBeVisible()
    expect(screen.getByRole('heading', { level: 3, name: 'Técnica' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Registrar evaluación técnica o táctica',
    })
    await user.click(within(dialog).getByRole('combobox', { name: 'Dimensión' }))
    await user.click(await screen.findByRole('option', { name: 'Táctica' }))
    await user.type(within(dialog).getByLabelText('Indicador'), 'Coberturas')
    await user.type(within(dialog).getByLabelText('Puntaje (1 a 10)'), '6')
    await user.click(within(dialog).getByRole('button', { name: /Registrar|Guardar/ }))

    await waitFor(() =>
      expect(evaluationsService.createTechnical).toHaveBeenCalledWith(
        expect.objectContaining({ dimension: 'tactica', indicator: 'Coberturas', score: 6 }),
      ),
    )
  })

  describe('deportista que juega ambos deportes', () => {
    const FUTBOL17 = {
      id_category: 7,
      name: 'Fútbol Sub-17',
      min_age: 14,
      max_age: 17,
      sport: 'futbol' as const,
    }

    beforeEach(() => {
      primeAppDataMocks({ categories: [FUTBOL17, SALA] })
      vi.mocked(usersService.listAllAthletes).mockResolvedValue([ATHLETE_USER])
      vi.mocked(athleteAssignmentsService.listAll).mockResolvedValue([
        {
          id_ath_cat: 40,
          id_user: ATHLETE_USER.id_user,
          id_category: FUTBOL17.id_category,
          category_name: FUTBOL17.name,
          name: ATHLETE_USER.name,
          lastname: ATHLETE_USER.lastname,
          id_season: ACTIVE_SEASON.id_season,
          position: 'Delantero',
        },
        {
          id_ath_cat: 41,
          id_user: ATHLETE_USER.id_user,
          id_category: SALA.id_category,
          category_name: SALA.name,
          name: ATHLETE_USER.name,
          lastname: ATHLETE_USER.lastname,
          id_season: ACTIVE_SEASON.id_season,
          position: 'Ala',
        },
      ])
    })

    it('muestra cada equipo en la ficha y pide el deporte al evaluar', async () => {
      vi.mocked(evaluationsService.createTechnical).mockResolvedValue({
        status: 'Success',
        mensaje: 'ok',
      })
      signInAs(COACH_USER)
      const user = userEvent.setup()
      renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}?tab=tecnico`)

      expect(
        await screen.findByText(
          'Fútbol Sub-17 · Fútbol · Delantero | Sala Sub-17 · Fútbol sala · Ala',
          { exact: false },
        ),
      ).toBeInTheDocument()

      const [registerButton] = await screen.findAllByRole('button', {
        name: 'Registrar evaluación',
      })
      await user.click(registerButton)
      const dialog = await screen.findByRole('dialog', {
        name: 'Registrar evaluación técnica o táctica',
      })
      await user.type(within(dialog).getByLabelText('Indicador'), 'Pase raso')
      await user.type(within(dialog).getByLabelText('Puntaje (1 a 10)'), '7')
      await user.click(within(dialog).getByRole('button', { name: /Registrar|Guardar/ }))
      expect(await within(dialog).findByText('Elige el deporte.')).toBeInTheDocument()
      expect(evaluationsService.createTechnical).not.toHaveBeenCalled()

      await user.click(within(dialog).getByRole('combobox', { name: 'Deporte' }))
      await user.click(await screen.findByRole('option', { name: 'Fútbol sala' }))
      await user.click(within(dialog).getByRole('button', { name: /Registrar|Guardar/ }))

      await waitFor(() =>
        expect(evaluationsService.createTechnical).toHaveBeenCalledWith(
          expect.objectContaining({ sport: 'futbol_sala', indicator: 'Pase raso' }),
        ),
      )
    })

    it('separa la participación y el índice por deporte en el resumen', async () => {
      const participation = (minutes: number) => ({
        matches_in_season: 2,
        matches_played: 2,
        total_minutes: minutes,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
      })
      const training = {
        total_sessions: 4,
        sessions_attended: 4,
        attendance_rate: 100,
        avg_rpe: 6,
        total_session_load: 2000,
      }
      const index = (id_index: number, sport: 'futbol' | 'futbol_sala', value: number) => ({
        id_index,
        id_user: ATHLETE_USER.id_user,
        id_season: ACTIVE_SEASON.id_season,
        sport,
        physical_score: value,
        technical_score: value,
        participation_score: value,
        index_value: value,
      })
      vi.mocked(reportsService.seasonSummary).mockResolvedValue({
        athlete: {
          id_user: ATHLETE_USER.id_user,
          name: 'Ana María',
          lastname: 'Pérez',
          position: 'Delantero',
          category: FUTBOL17.name,
          sport: 'futbol',
          sports: ['futbol', 'futbol_sala'],
        },
        season: { id_season: ACTIVE_SEASON.id_season, name: ACTIVE_SEASON.name },
        training_participation: training,
        match_participation: participation(220),
        fatigue_alerts: [],
        injury_risk_assessments: [],
        weighted_progress_index: index(1, 'futbol', 62),
        by_sport: [
          {
            sport: 'futbol',
            category: FUTBOL17.name,
            position: 'Delantero',
            training_participation: training,
            match_participation: { ...participation(180), match_minutes: 90 },
            weighted_progress_index: index(1, 'futbol', 62),
          },
          {
            sport: 'futbol_sala',
            category: SALA.name,
            position: 'Ala',
            training_participation: training,
            match_participation: { ...participation(80), match_minutes: 40 },
            weighted_progress_index: index(2, 'futbol_sala', 88),
          },
        ],
      })
      signInAs(COACH_USER)
      const user = userEvent.setup()
      renderAppAt(`/app/deportistas/${ATHLETE_USER.id_user}?tab=resumen`)

      const sports = await screen.findByRole('group', { name: 'Deporte' })
      expect(
        within(sports).getByRole('button', { name: /Fútbol · Fútbol Sub-17/ }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('180')).toBeInTheDocument()

      await user.click(within(sports).getByRole('button', { name: /Fútbol sala · Sala Sub-17/ }))

      expect(await screen.findByText('80')).toBeInTheDocument()
      expect(screen.getByText(/Valor del índice: 88/)).toBeInTheDocument()
    })
  })
})
