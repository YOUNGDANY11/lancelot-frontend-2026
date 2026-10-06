import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertsService } from '@/services/alertsService'
import { authService } from '@/services/authService'
import { seasonsService } from '@/services/seasonsService'
import { usersService } from '@/services/usersService'
import { ACTIVE_SEASON, primeAppDataMocks } from '@/test/appDataMocks'
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
  seasonsService: { listAll: vi.fn(), create: vi.fn(), update: vi.fn() },
}))

vi.mock('@/services/categoriesService', () => ({
  categoriesService: { listAll: vi.fn(), create: vi.fn() },
}))

vi.mock('@/services/athleteAssignmentsService', () => ({
  athleteAssignmentsService: {
    list: vi.fn(),
    listAll: vi.fn(),
    count: vi.fn(),
    getMine: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('@/services/alertsService', () => ({
  alertsService: { countOpen: vi.fn() },
}))

vi.mock('@/services/weightProfilesService', () => ({
  weightProfilesService: { listAll: vi.fn(), count: vi.fn(), create: vi.fn() },
}))

vi.mock('@/services/parentalConsentsService', () => ({
  parentalConsentsService: { listAll: vi.fn(), create: vi.fn() },
}))

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

beforeAll(async () => {
  await Promise.all([
    import('@/views/app/home/HomeView'),
    import('@/components/modules/home/AdminHome'),
    import('@/components/modules/home/CoachHome'),
  ])
})

describe('estructura de la aplicación', () => {
  beforeEach(() => {
    primeAppDataMocks()
  })

  it('muestra al entrenador sus módulos y el contexto de la temporada activa', async () => {
    signInAs(COACH_USER)
    renderAppAt('/app/inicio')

    const sidebar = await screen.findByRole('complementary')
    const nav = within(sidebar).getByRole('navigation', { name: 'Módulos' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Inicio', 'Club', 'Deportistas', 'Entrenamiento', 'Salud', 'Talento y progreso'])
    expect(await screen.findAllByText(ACTIVE_SEASON.name)).not.toHaveLength(0)
  })

  it('lleva al deportista a su propia ficha y no le muestra la campana de alertas', async () => {
    signInAs(ATHLETE_USER)
    renderAppAt('/app/inicio')

    const sidebar = await screen.findByRole('complementary')
    expect(within(sidebar).getByRole('link', { name: 'Mi ficha' })).toHaveAttribute(
      'href',
      '/app/deportistas/7',
    )
    expect(screen.queryByRole('button', { name: /^Alertas/ })).not.toBeInTheDocument()
  })

  it('envía a la página 403 cuando el rol no tiene acceso al módulo', async () => {
    signInAs(ATHLETE_USER)
    const { router } = renderAppAt('/app/club')

    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
    expect(
      await screen.findByRole('heading', { name: 'No tienes permiso para ver esta página' }),
    ).toBeInTheDocument()
  })

  it('cuenta las alertas pendientes en la campana', async () => {
    vi.mocked(alertsService.countOpen).mockResolvedValue({ fatigue: 2, risk: 1, total: 3 })
    signInAs(COACH_USER)
    renderAppAt('/app/inicio')

    expect(
      await screen.findByRole('button', { name: 'Alertas: 3 alertas pendientes' }),
    ).toBeInTheDocument()
  })
})

describe('guía de configuración inicial', () => {
  it('guía al administrador y crea la temporada desde el inicio', async () => {
    primeAppDataMocks({ seasons: [], categories: [] })
    vi.mocked(seasonsService.create).mockResolvedValue({ ...ACTIVE_SEASON, id_season: 9 })
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/inicio')

    const checklist = await screen.findByRole('region', { name: 'Configura tu club' })
    expect(await within(checklist).findByText('0 de 6 pasos completos')).toBeInTheDocument()

    await user.click(within(checklist).getByRole('button', { name: 'Crear temporada' }))
    const dialog = await screen.findByRole('dialog', { name: 'Crear temporada' })
    await user.type(within(dialog).getByLabelText('Nombre'), 'Temporada 2026')
    await user.type(within(dialog).getByLabelText('Fecha de inicio'), '2026-02-01')
    await user.click(within(dialog).getByRole('button', { name: 'Crear temporada' }))

    await waitFor(() =>
      expect(seasonsService.create).toHaveBeenCalledWith({
        name: 'Temporada 2026',
        start_date: '2026-02-01',
        status: 'active',
      }),
    )
  })

  it('no aparece para el entrenador', async () => {
    primeAppDataMocks()
    signInAs(COACH_USER)
    renderAppAt('/app/inicio')

    await screen.findByRole('heading', { name: 'Hola, Carlos' })
    expect(screen.queryByRole('region', { name: 'Configura tu club' })).not.toBeInTheDocument()
  })
})
