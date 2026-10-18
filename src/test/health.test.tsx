import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/services/authService'
import { healthService } from '@/services/healthService'
import { mlService } from '@/services/mlService'
import { usersService } from '@/services/usersService'
import { primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { inboxItem, mockOpenInbox } from '@/test/inboxMocks'
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
  parentalConsentsService: {
    listAll: vi.fn(),
    listPage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))
vi.mock('@/services/mlService', () => ({
  mlService: { runNow: vi.fn() },
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
    listInboxPage: vi.fn(),
    listOpenInbox: vi.fn(),
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

const FATIGUE = inboxItem({
  kind: 'fatigue',
  id: 1,
  id_user: ATHLETE_USER.id_user,
  athleteName: 'Ana María Pérez',
  date: '2026-10-04',
  acuteLoad: 520,
  chronicLoad: 340,
  acwr: 1.53,
  rpeAvg: 7.2,
  level: 'medio',
})

const RISK = inboxItem({
  kind: 'risk',
  id: 9,
  id_user: 8,
  athleteName: 'Bruno Díaz',
  date: '2026-10-03',
  level: 'alto',
  acwr: 1.71,
  method: 'rules',
  rules: ['acwr_sostenido'],
})

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
  mockOpenInbox([FATIGUE, RISK])
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
      mockOpenInbox([FATIGUE])
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
  it('deja ejecutar el análisis al momento y muestra lo que encontró', async () => {
    vi.mocked(mlService.runNow).mockImplementation(async () => {
      mockOpenInbox([RISK, FATIGUE])
      return {
        mensaje: 'ok',
        date: '2026-10-18',
        duration_ms: 1500,
        fatigue_alerts: { athletes: 2, created: 1, updated: 0, removed: 0, failed: 0 },
        risk_assessments: { athletes: 2, created: 0, updated: 1, removed: 0, failed: 0 },
        snapshot: { athletes: 2, snapshots: 2, failed: 0 },
        inference: { engine: 'rules', predicted: 0, assessments_created: 0, failed: 0 },
        labels: { processed: 0, labeled_positive: 0, unknown_mechanism: 0 },
        talent_dataset: { rows: 0, labeled: 0, promoted: 0, pending: 0, excluded: 0 },
        open_today: { fatigue_alerts: 1, risk_assessments: 1 },
      }
    })
    mockOpenInbox([])
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/salud')

    expect(await screen.findByText('No hay alertas pendientes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ejecutar análisis ahora' }))

    const dialog = await screen.findByRole('dialog', { name: 'Análisis inmediato' })
    expect(within(dialog).getByText('1 alerta nueva')).toBeInTheDocument()
    expect(within(dialog).getByText('1 actualizada')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Alertas de fatiga abiertas hoy').nextSibling?.textContent,
    ).toBe('1')
    await user.click(within(dialog).getByRole('button', { name: 'Entendido' }))

    const list = await screen.findByRole('list', { name: 'Alertas pendientes' })
    expect(within(list).getAllByRole('article')).toHaveLength(2)
    expect(mlService.runNow).toHaveBeenCalledTimes(1)
  })

  it('pagina las alertas desde el backend y reinicia la página al filtrar', async () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      inboxItem({
        kind: 'fatigue',
        id: 100 + index,
        id_user: 200 + index,
        athleteName: `Deportista ${String(index + 1).padStart(2, '0')}`,
        level: 'medio',
      }),
    )
    mockOpenInbox([...many, RISK])
    signInAs(HEALTH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/salud')

    const list = await screen.findByRole('list', { name: 'Alertas pendientes' })
    expect(within(list).getAllByRole('article')).toHaveLength(10)
    const nav = screen.getByRole('navigation', { name: 'Paginación de la bandeja de alertas' })
    expect(within(nav).getByText('Página 1 de 2 · 13 alertas')).toBeInTheDocument()

    await user.click(within(nav).getByRole('button', { name: 'Página siguiente' }))

    expect(await screen.findByText('Página 2 de 2 · 13 alertas')).toBeInTheDocument()
    expect(healthService.listInboxPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'open', page: 2, limit: 10 }),
    )
    expect(screen.getByRole('heading', { name: 'Deportista 12' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Riesgo de lesión/ }))

    expect(await screen.findByRole('heading', { name: 'Bruno Díaz' })).toBeInTheDocument()
    expect(healthService.listInboxPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ kind: 'risk', page: 1 }),
    )
    expect(
      screen.queryByRole('navigation', { name: 'Paginación de la bandeja de alertas' }),
    ).not.toBeInTheDocument()
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
