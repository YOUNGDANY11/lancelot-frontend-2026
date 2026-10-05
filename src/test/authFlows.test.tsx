import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROLE_SUMMARIES } from '@/constants/roles'
import { authService } from '@/services/authService'
import { usersService } from '@/services/usersService'
import { createApiError } from '@/test/apiErrors'
import { primeAppDataMocks } from '@/test/appDataMocks'
import { ATHLETE_USER, COACH_USER, LOGIN_SUCCESS } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
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

async function fillLogin(email: string, password: string) {
  const user = userEvent.setup()
  const dialog = await screen.findByRole('dialog', { name: 'Iniciar sesión' })
  const emailInput = within(dialog).getByLabelText('Correo')
  await user.clear(emailInput)
  await user.type(emailInput, email)
  await user.type(within(dialog).getByLabelText('Contraseña'), password)
  await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))
  return user
}

async function openLoginFromNavbar() {
  const user = userEvent.setup()
  await screen.findByRole('heading', { level: 1 })
  const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
  await user.click(within(nav).getByRole('button', { name: 'Iniciar sesión' }))
}

describe('flujos de sesión', () => {
  beforeEach(() => {
    primeAppDataMocks()
    vi.mocked(authService.login).mockResolvedValue(LOGIN_SUCCESS)
    vi.mocked(authService.logout).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
    vi.mocked(usersService.getMe).mockResolvedValue(ATHLETE_USER)
  })

  it('inicia sesión, consulta /users/me y lleva al inicio del rol', async () => {
    const { router } = renderAppAt('/')
    await openLoginFromNavbar()
    await fillLogin('ana.perez@club.com', 'secreta1')

    await waitFor(() => expect(router.state.location.pathname).toBe('/app/inicio'))
    expect(authService.login).toHaveBeenCalledWith({
      email: 'ana.perez@club.com',
      password: 'secreta1',
    })
    expect(usersService.getMe).toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe('refresh-token')
  })

  it('muestra el error del backend en español si las credenciales fallan', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      createApiError(401, { status: 'Error', mensaje: 'Contraseña incorrecta' }),
    )
    renderAppAt('/')
    await openLoginFromNavbar()
    await fillLogin('ana.perez@club.com', 'secreta1')

    expect(await screen.findByText('La contraseña no es correcta.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('valida el formulario en español antes de llamar al backend', async () => {
    renderAppAt('/')
    await openLoginFromNavbar()
    const user = userEvent.setup()
    const dialog = await screen.findByRole('dialog', { name: 'Iniciar sesión' })
    await user.click(within(dialog).getByRole('button', { name: 'Iniciar sesión' }))

    expect(await within(dialog).findByText('Escribe tu correo.')).toBeInTheDocument()
    expect(within(dialog).getByText('Escribe tu contraseña.')).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('redirige una ruta privada sin sesión al inicio, abre el login y vuelve a la ruta pedida', async () => {
    const { router } = renderAppAt('/app/perfil')

    expect(await screen.findByRole('dialog', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')

    await fillLogin('ana.perez@club.com', 'secreta1')

    await waitFor(() => expect(router.state.location.pathname).toBe('/app/perfil'))
    expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument()
  })

  it('recupera la sesión guardada al recargar la página', async () => {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
    vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
    vi.mocked(usersService.getMe).mockResolvedValue(COACH_USER)

    renderAppAt('/app/inicio')

    expect(await screen.findByRole('heading', { name: 'Hola, Carlos' })).toBeInTheDocument()
    expect(authService.refreshSession).toHaveBeenCalledTimes(1)
    expect(screen.getByText(ROLE_SUMMARIES.ENTRENADOR)).toBeInTheDocument()
  })

  it('cierra sesión desde el menú de usuario sin pedir login de nuevo', async () => {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
    vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
    const { router } = renderAppAt('/app/inicio')
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Abrir menú de usuario' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(authService.logout).toHaveBeenCalledWith('refresh-guardado')
    expect(screen.queryByRole('dialog', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBeNull()
  })
})

describe('registro', () => {
  async function openRegister() {
    const user = userEvent.setup()
    renderAppAt('/')
    await screen.findByRole('heading', { level: 1 })
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await user.click(within(nav).getByRole('button', { name: 'Crear cuenta' }))
    const dialog = await screen.findByRole('dialog', { name: 'Crear cuenta' })
    return { user, dialog }
  }

  async function fillRegister(
    user: ReturnType<typeof userEvent.setup>,
    dialog: HTMLElement,
    birthDate: string,
  ) {
    await user.type(within(dialog).getByLabelText('Nombres'), 'Ana María')
    await user.type(within(dialog).getByLabelText('Apellidos'), 'Pérez')
    await user.type(within(dialog).getByLabelText('Correo'), 'ana.perez@club.com')
    await user.type(within(dialog).getByLabelText('Fecha de nacimiento'), birthDate)
    await user.type(within(dialog).getByLabelText('Contraseña'), 'secreta1')
    await user.type(within(dialog).getByLabelText('Confirmar contraseña'), 'secreta1')
  }

  it('explica que el registro crea cuentas de deportista', async () => {
    const { dialog } = await openRegister()
    expect(
      within(dialog).getByText(
        '¿Eres parte del cuerpo técnico? El administrador del club crea tu cuenta con tu rol.',
      ),
    ).toBeInTheDocument()
  })

  it('avisa sobre el consentimiento del acudiente cuando la persona es menor', async () => {
    const { user, dialog } = await openRegister()
    await user.type(within(dialog).getByLabelText('Fecha de nacimiento'), '2015-06-01')

    expect(await within(dialog).findByText('Eres menor de edad')).toBeInTheDocument()
  })

  it('crea la cuenta y abre el login con el correo diligenciado', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      status: 'Success',
      mensaje: 'Usuario registrado con exito',
      user: ATHLETE_USER,
    })
    const { user, dialog } = await openRegister()
    await fillRegister(user, dialog, '2011-04-12')
    await user.click(within(dialog).getByRole('button', { name: 'Crear cuenta' }))

    const loginDialog = await screen.findByRole('dialog', { name: 'Iniciar sesión' })
    expect(within(loginDialog).getByLabelText('Correo')).toHaveValue('ana.perez@club.com')
    expect(authService.register).toHaveBeenCalledWith({
      name: 'Ana María',
      lastname: 'Pérez',
      email: 'ana.perez@club.com',
      password: 'secreta1',
      birth_date: '2011-04-12',
    })
  })

  it('marca el correo cuando ya está en uso', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      createApiError(400, {
        status: 'Error',
        mensaje: 'Este correo ya esta asociado a un usuario',
      }),
    )
    const { user, dialog } = await openRegister()
    await fillRegister(user, dialog, '2011-04-12')
    await user.click(within(dialog).getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await within(dialog).findByText('Este correo ya está asociado a otra cuenta.'),
    ).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('mi perfil', () => {
  beforeEach(() => {
    primeAppDataMocks()
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
    vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
    vi.mocked(usersService.getMe).mockResolvedValue(ATHLETE_USER)
  })

  it('guarda solo los cuatro campos permitidos del perfil', async () => {
    vi.mocked(usersService.updateMe).mockResolvedValue({ ...ATHLETE_USER, name: 'Ana Lucía' })
    renderAppAt('/app/perfil')
    const user = userEvent.setup()

    const nameInput = await screen.findByLabelText('Nombres')
    await waitFor(() => expect(nameInput).toHaveValue('Ana María'))
    await user.clear(nameInput)
    await user.type(nameInput, 'Ana Lucía')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(usersService.updateMe).toHaveBeenCalledWith({
        name: 'Ana Lucía',
        lastname: 'Pérez',
        email: 'ana.perez@club.com',
        birth_date: '2011-04-12',
      }),
    )
    expect(await screen.findByText('Tus datos quedaron guardados.')).toBeInTheDocument()
  })

  it('muestra en el campo el error de contraseña actual incorrecta', async () => {
    vi.mocked(usersService.changeMyPassword).mockRejectedValue(
      createApiError(400, { status: 'Error', mensaje: 'La contraseña actual no es correcta' }),
    )
    renderAppAt('/app/perfil')
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText('Contraseña actual'), 'equivocada')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'nueva123')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'nueva123')
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }))

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('aria-invalid', 'true')
    expect(usersService.changeMyPassword).toHaveBeenCalledWith({
      current_password: 'equivocada',
      new_password: 'nueva123',
    })
  })

  it('confirma antes de cerrar sesión en todos los dispositivos', async () => {
    vi.mocked(authService.logoutAll).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
    const { router } = renderAppAt('/app/perfil')
    const user = userEvent.setup()

    await user.click(
      await screen.findByRole('button', { name: 'Cerrar sesión en todos los dispositivos' }),
    )
    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: 'Cerrar todas las sesiones' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(authService.logoutAll).toHaveBeenCalledTimes(1)
  })
})
