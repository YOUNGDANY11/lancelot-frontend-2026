import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { alertsService } from '@/services/alertsService'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { authService } from '@/services/authService'
import { healthService } from '@/services/healthService'
import { mlService } from '@/services/mlService'
import { talentService } from '@/services/talentService'
import { trainingService } from '@/services/trainingService'
import { usersService } from '@/services/usersService'
import { ACTIVE_SEASON, SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, ATHLETE_USER, COACH_USER } from '@/test/fixtures'
import { inboxItem, mockOpenInbox } from '@/test/inboxMocks'
import { renderAppAt } from '@/test/renderWithProviders'
import type { TalentFlag } from '@/types/talent'
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
vi.mock('@/services/talentService', () => ({
  talentService: {
    listIndices: vi.fn(),
    recalculateSeason: vi.fn(),
    recalculateAthlete: vi.fn(),
    listFlags: vi.fn(),
    countFlags: vi.fn(),
    detect: vi.fn(),
    createFlag: vi.fn(),
    reviewFlag: vi.fn(),
  },
}))
vi.mock('@/services/healthService', () => ({
  healthService: {
    listAllInjuries: vi.fn(),
    injuryMechanismTotals: vi.fn(),
    listInboxPage: vi.fn(),
    listOpenInbox: vi.fn(),
    reviewFatigueAlert: vi.fn(),
    reviewRiskAssessment: vi.fn(),
    reviewTotals: vi.fn(),
  },
}))
vi.mock('@/services/trainingService', () => ({
  trainingService: {
    listSessions: vi.fn(),
    listAllSessions: vi.fn(),
    categoryAcwr: vi.fn(),
  },
}))
vi.mock('@/services/competitionService', () => ({
  competitionService: { listAllMatches: vi.fn(), listCompetencies: vi.fn() },
}))
vi.mock('@/services/mlService', () => ({
  mlService: { engineConfig: vi.fn(), readiness: vi.fn(), dataQuality: vi.fn() },
}))

const DT_USER: User = {
  ...COACH_USER,
  id_user: 12,
  id_role: 4,
  name: 'Diana',
  role_name: 'DIRECTOR_TECNICO',
}
const HEALTH_USER: User = {
  ...COACH_USER,
  id_user: 11,
  id_role: 5,
  name: 'Sofía',
  role_name: 'ENCARGADO_SALUD',
}

const BRUNO = { id_user: 8, name: 'Bruno', lastname: 'Díaz' }

const FLAG: TalentFlag = {
  id_flag: 40,
  id_user: ATHLETE_USER.id_user,
  athlete_name: 'Ana María Pérez',
  id_season: ACTIVE_SEASON.id_season,
  criteria: 'Percentil 92 del índice en su cohorte',
  recommended_action: 'Entrenar una semana con la categoría superior',
  status: 'open',
  source: 'rules',
  score: 92,
  triggered_rules: ['percentil_alto', 'disponibilidad'],
  warnings: ['Posible efecto de edad relativa: nacido en el primer trimestre'],
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

beforeAll(async () => {
  await Promise.all([
    import('@/views/app/talent/TalentView'),
    import('@/components/modules/home/AdminHome'),
    import('@/components/modules/home/DirectorHome'),
    import('@/components/modules/home/HealthHome'),
  ])
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
    {
      id_ath_cat: 31,
      ...BRUNO,
      id_category: SUB15.id_category,
      category_name: SUB15.name,
      id_season: ACTIVE_SEASON.id_season,
      position: 'Delantero',
    },
  ])
  vi.mocked(talentService.listIndices).mockResolvedValue([
    {
      id_index: 1,
      id_user: ATHLETE_USER.id_user,
      athlete_name: 'Ana María Pérez',
      id_season: ACTIVE_SEASON.id_season,
      physical_score: 70,
      technical_score: 75,
      participation_score: 80,
      index_value: 74.5,
    },
    {
      id_index: 2,
      id_user: BRUNO.id_user,
      athlete_name: 'Bruno Díaz',
      id_season: ACTIVE_SEASON.id_season,
      physical_score: 82,
      technical_score: 80,
      participation_score: 85,
      index_value: 82.3,
    },
  ])
  vi.mocked(talentService.listFlags).mockResolvedValue([FLAG])
  vi.mocked(talentService.countFlags).mockResolvedValue(3)
  vi.mocked(talentService.reviewFlag).mockResolvedValue(undefined)
  vi.mocked(talentService.recalculateAthlete).mockResolvedValue(undefined)
  mockOpenInbox([
    inboxItem({
      kind: 'risk',
      id: 9,
      id_user: BRUNO.id_user,
      athleteName: 'Bruno Díaz',
      date: '2026-10-04',
      level: 'alto',
      acwr: 1.7,
      method: 'rules',
      rules: ['acwr_sostenido'],
    }),
  ])
  vi.mocked(healthService.reviewTotals).mockResolvedValue({ reviewed: 0, dismissed: 0 })
  vi.mocked(healthService.listAllInjuries).mockResolvedValue([])
  vi.mocked(healthService.injuryMechanismTotals).mockResolvedValue({
    total: 2,
    contact: 1,
    nonContact: 0,
    missing: 1,
  })
  vi.mocked(alertsService.countOpen).mockResolvedValue({ fatigue: 0, risk: 1, total: 1 })
  vi.mocked(trainingService.listSessions).mockResolvedValue({
    items: [],
    pagination: { total: 24, page: 1, limit: 1, totalPages: 24 },
  })
  vi.mocked(usersService.listAllAthletes).mockResolvedValue([ATHLETE_USER])
})

describe('talento y progreso', () => {
  it('ordena el ranking y recalcula el índice de un deportista', async () => {
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/talento')

    const table = await screen.findByRole('table', { name: 'Índices de progreso' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getAllByRole('cell')[1].textContent)).toEqual([
      'Bruno DíazSub-15 · Delantero',
      'Ana María PérezSub-15 · Portero',
    ])
    expect(screen.queryByRole('button', { name: 'Recalcular temporada' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Recalcular el índice de Bruno Díaz' }))
    await waitFor(() =>
      expect(talentService.recalculateAthlete).toHaveBeenCalledWith(8, ACTIVE_SEASON.id_season),
    )
  })

  it('deja al director técnico detectar talento y muestra el resumen', async () => {
    vi.mocked(talentService.detect).mockResolvedValue({
      mensaje: 'Detección de talento completada: 2 deportistas evaluados, 1 señalados',
      evaluated: 2,
      flagged: 1,
      created: 1,
      updated: 0,
      skipped: 0,
      removed: 0,
      failed: [{ id_user: ATHLETE_USER.id_user, mensaje: 'No tiene posición asignada' }],
    })
    signInAs(DT_USER)
    const user = userEvent.setup()
    renderAppAt('/app/talento?tab=senalizaciones')

    expect(await screen.findByText('Percentil alto en su categoría')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Advertencias' })).getByText(
        /efecto de edad relativa/,
      ),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Detectar talento' }))
    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: 'Detectar' }))

    const summary = await screen.findByRole('dialog', { name: 'Detección de talento' })
    expect(within(summary).getByText('Evaluados').nextSibling?.textContent).toBe('2')
    expect(within(summary).getByText('No tiene posición asignada')).toBeInTheDocument()
    expect(within(summary).getByText('Ana María Pérez')).toBeInTheDocument()
  })

  it('no le ofrece al entrenador la detección, pero sí revisar una señalización', async () => {
    signInAs(COACH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/talento?tab=senalizaciones')

    await user.click(
      await screen.findByRole('button', {
        name: 'Marcar como revisada la señalización de Ana María Pérez',
      }),
    )
    expect(screen.queryByRole('button', { name: 'Detectar talento' })).not.toBeInTheDocument()
    await waitFor(() => expect(talentService.reviewFlag).toHaveBeenCalledWith(40, 'reviewed'))
  })
})

describe('inicio según el rol', () => {
  it('muestra al director técnico los KPI de la temporada y el top del índice', async () => {
    signInAs(DT_USER)
    renderAppAt('/app/inicio')

    const kpis = await screen.findByRole('region', { name: `Resumen de ${ACTIVE_SEASON.name}` })
    await waitFor(() => expect(within(kpis).getByText('24')).toBeInTheDocument())
    expect(within(kpis).getByText('Deportistas').closest('div')?.parentElement).toHaveTextContent(
      '2',
    )
    expect(
      within(kpis).getByText('Talento por revisar').closest('div')?.parentElement,
    ).toHaveTextContent('3')

    const top = await screen.findByRole('region', { name: 'Top 5 del índice de progreso' })
    expect(within(top).getAllByRole('listitem')[0]).toHaveTextContent('Bruno Díaz')
  })

  it('deja al encargado de salud revisar una alerta desde el inicio con un clic', async () => {
    vi.mocked(healthService.reviewRiskAssessment).mockResolvedValue({
      status: 'Success',
      mensaje: 'ok',
    })
    signInAs(HEALTH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/inicio')

    await user.click(
      await screen.findByRole('button', { name: 'Marcar como revisada la alerta de Bruno Díaz' }),
    )
    await waitFor(() =>
      expect(healthService.reviewRiskAssessment).toHaveBeenCalledWith(9, 'reviewed'),
    )
    expect(screen.getByText('1 lesión sin mecanismo registrado.')).toBeInTheDocument()
    const minors = screen.getByRole('region', { name: 'Menores sin consentimiento' })
    expect(await within(minors).findByText('Ana María Pérez')).toBeInTheDocument()
  })

  it('muestra al administrador los usuarios por rol y el estado del motor de IA', async () => {
    vi.mocked(usersService.listAll).mockResolvedValue([ADMIN_USER, COACH_USER, ATHLETE_USER])
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
          descripcion: 'Días distintos con snapshots etiquetados',
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
    signInAs(ADMIN_USER)
    renderAppAt('/app/inicio')

    const users = await screen.findByRole('region', { name: 'Usuarios por rol' })
    expect(await within(users).findByText('3 cuentas en total')).toBeInTheDocument()
    const engine = screen.getByRole('region', { name: 'Motor de IA y readiness' })
    expect(await within(engine).findByText('Solo reglas')).toBeInTheDocument()
    expect(within(engine).getByText('40 de 180')).toBeInTheDocument()
    expect(within(engine).getByText('Faltan 140')).toBeInTheDocument()
    const quality = screen.getByRole('region', { name: 'Calidad de los datos' })
    expect(await within(quality).findByText('25 % de 4')).toBeInTheDocument()
  })
})
