import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/services/authService'
import { healthService } from '@/services/healthService'
import { usersService } from '@/services/usersService'
import { primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type { FatigueAlert, InjuryRiskAssessment } from '@/types/club'
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
  parentalConsentsService: {
    listAll: vi.fn(),
    listPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/healthService', () => ({
  healthService: {
    listInjuries: vi.fn(),
    listInjuriesPage: vi.fn(),
    listAllInjuries: vi.fn(),
    injuryMechanismTotals: vi.fn(),
    createInjury: vi.fn(),
    updateInjury: vi.fn(),
    removeInjury: vi.fn(),
    listHealthRecords: vi.fn(),
    listHealthRecordsPage: vi.fn(),
    createHealthRecord: vi.fn(),
    updateHealthRecord: vi.fn(),
    removeHealthRecord: vi.fn(),
    listAuditLogs: vi.fn(),
    listOpenFatigueAlerts: vi.fn(),
    listOpenRiskAssessments: vi.fn(),
    reviewFatigueAlert: vi.fn(),
    reviewRiskAssessment: vi.fn(),
    reviewTotals: vi.fn(),
  },
}))

const HEALTH_USER: User = {
  ...COACH_USER,
  id_user: 11,
  id_role: 5,
  name: 'Sofía',
  lastname: 'Mejía',
  role_name: 'ENCARGADO_SALUD',
}
const DT_USER: User = { ...COACH_USER, id_user: 12, id_role: 4, role_name: 'DIRECTOR_TECNICO' }

const EMPTY_PAGE = { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } }

const FATIGUE: FatigueAlert = {
  id_alert: 1,
  id_user: ATHLETE_USER.id_user,
  athlete_name: 'Ana María Pérez',
  date: '2026-10-04',
  acute_load: 520,
  chronic_load: 340,
  acwr_value: 1.53,
  rpe_avg: 7.2,
  level: 'medio',
  status: 'open',
}

const RISK: InjuryRiskAssessment = {
  id_assessment: 9,
  id_user: 8,
  athlete_name: 'Bruno Díaz',
  assessment_date: '2026-10-03',
  risk_level: 'alto',
  status: 'open',
  acwr_value: 1.71,
  method: 'rules',
  triggered_rules: ['acwr_sostenido'],
  details: null,
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

beforeAll(async () => {
  await import('@/views/app/health/HealthView')
})

beforeEach(() => {
  primeAppDataMocks()
  vi.mocked(healthService.listOpenFatigueAlerts).mockResolvedValue([FATIGUE])
  vi.mocked(healthService.listOpenRiskAssessments).mockResolvedValue([RISK])
  vi.mocked(healthService.reviewTotals).mockResolvedValue({ reviewed: 4, dismissed: 1 })
  vi.mocked(healthService.listInjuriesPage).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(healthService.injuryMechanismTotals).mockResolvedValue({
    total: 3,
    contact: 1,
    nonContact: 1,
    missing: 1,
  })
  vi.mocked(healthService.listHealthRecordsPage).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(healthService.listAuditLogs).mockResolvedValue(EMPTY_PAGE)
  vi.mocked(healthService.createInjury).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
  vi.mocked(usersService.listAllAthletes).mockResolvedValue([ATHLETE_USER])
})

async function tabNames() {
  const tabList = await screen.findByRole('tablist', { name: 'Secciones de salud' })
  return within(tabList)
    .getAllByRole('tab')
    .map((tab) => tab.textContent)
}

describe('pestañas de salud según el rol', () => {
  it.each([
    [
      'encargado de salud',
      HEALTH_USER,
      ['Bandeja de alertas', 'Lesiones', 'Registros de salud', 'Consentimientos'],
    ],
    ['entrenador', COACH_USER, ['Bandeja de alertas', 'Lesiones']],
    ['director técnico', DT_USER, ['Bandeja de alertas']],
    [
      'administrador',
      ADMIN_USER,
      ['Bandeja de alertas', 'Lesiones', 'Registros de salud', 'Consentimientos', 'Auditoría'],
    ],
  ])('muestra al %s solo lo que le corresponde', async (_role, user, expected) => {
    signInAs(user)
    renderAppAt('/app/salud')
    expect(await tabNames()).toEqual(expected)
  })
})

describe('bandeja de alertas', () => {
  it('ordena por nivel y deja revisar una alerta con un clic', async () => {
    vi.mocked(healthService.reviewRiskAssessment).mockImplementation(async () => {
      vi.mocked(healthService.listOpenRiskAssessments).mockResolvedValue([])
      return { status: 'Success', mensaje: 'ok' }
    })
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/salud')

    const list = await screen.findByRole('list', { name: 'Alertas pendientes' })
    const titles = within(list)
      .getAllByRole('article')
      .map((card) => within(card).getByRole('heading').textContent)
    expect(titles).toEqual(['Bruno Díaz', 'Ana María Pérez'])
    expect(screen.getByText('El sistema sugiere; tú decides.')).toBeInTheDocument()
    expect(screen.getByText('ACWR alto sostenido')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Marcar como revisada la alerta de Bruno Díaz' }),
    )

    expect(healthService.reviewRiskAssessment).toHaveBeenCalledWith(9, 'reviewed')
    expect(
      await screen.findByText('La evaluación de riesgo de Bruno Díaz quedó revisada.'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Bruno Díaz' })).not.toBeInTheDocument(),
    )
  })
})

describe('lesiones', () => {
  it('pide el mecanismo antes de registrar y avisa de las lesiones sin él', async () => {
    signInAs(HEALTH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/salud?tab=lesiones')

    expect(await screen.findByText(/1 lesión no tiene mecanismo registrado/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Registrar lesión' }))
    const sheet = await screen.findByRole('dialog', { name: 'Registrar lesión' })
    await user.click(within(sheet).getByRole('combobox', { name: 'Deportista' }))
    await user.click(await within(sheet).findByRole('option', { name: /Ana María Pérez/ }))
    await user.type(within(sheet).getByLabelText('Zona del cuerpo'), 'Tobillo')
    await user.click(within(sheet).getByRole('combobox', { name: 'Severidad' }))
    await user.click(await screen.findByRole('option', { name: 'Moderada' }))
    await user.click(within(sheet).getByRole('button', { name: 'Registrar' }))

    expect(
      await within(sheet).findByText('Indica si la lesión fue con o sin contacto.'),
    ).toBeInTheDocument()
    expect(healthService.createInjury).not.toHaveBeenCalled()

    await user.click(within(sheet).getByRole('radio', { name: /Sin contacto/ }))
    await user.click(within(sheet).getByRole('button', { name: 'Registrar' }))

    await waitFor(() =>
      expect(healthService.createInjury).toHaveBeenCalledWith(
        expect.objectContaining({
          id_user: ATHLETE_USER.id_user,
          body_part: 'Tobillo',
          severity: 'moderada',
          mechanism: 'sin_contacto',
          status: 'active',
          registered_by: HEALTH_USER.id_user,
        }),
      ),
    )
  })
})

describe('consentimientos', () => {
  it('destaca a los menores sin consentimiento otorgado', async () => {
    signInAs(HEALTH_USER)
    renderAppAt('/app/salud?tab=consentimientos')

    const section = await screen.findByRole('region', {
      name: /Menores sin consentimiento otorgado/,
    })
    expect(await within(section).findByText('Ana María Pérez')).toBeInTheDocument()
    expect(
      within(section).getByRole('button', {
        name: 'Registrar consentimiento de Ana María Pérez',
      }),
    ).toBeInTheDocument()
  })
})
