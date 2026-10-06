import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONFIG_DEFINITIONS } from '@/constants/configFields'
import { authService } from '@/services/authService'
import { configService } from '@/services/configService'
import { mlService } from '@/services/mlService'
import { rolesService } from '@/services/rolesService'
import { usersService } from '@/services/usersService'
import { createApiError } from '@/test/apiErrors'
import { SUB15, primeAppDataMocks } from '@/test/appDataMocks'
import { ADMIN_USER, COACH_USER } from '@/test/fixtures'
import { renderAppAt } from '@/test/renderWithProviders'
import type { MlModel, ValidationReport } from '@/types/ml'
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
  parentalConsentsService: { listAll: vi.fn(), create: vi.fn() },
}))
vi.mock('@/services/configService', () => ({
  configService: { getActive: vi.fn(), listOverrides: vi.fn(), update: vi.fn(), reset: vi.fn() },
}))
vi.mock('@/services/rolesService', () => ({
  rolesService: { list: vi.fn(), idsByCode: vi.fn() },
  toRoleCode: (role: { name: string }) => role.name,
}))
vi.mock('@/services/mlService', () => ({
  mlService: {
    engineConfig: vi.fn(),
    updateEngine: vi.fn(),
    readiness: vi.fn(),
    dataQuality: vi.fn(),
    listModels: vi.fn(),
    activateModel: vi.fn(),
    listFeatures: vi.fn(),
    exportFeatures: vi.fn(),
    backfill: vi.fn(),
    relabel: vi.fn(),
    validationReport: vi.fn(),
  },
}))

const DT_USER: User = { ...COACH_USER, id_user: 12, id_role: 4, role_name: 'DIRECTOR_TECNICO' }
const HEALTH_USER: User = { ...COACH_USER, id_user: 11, id_role: 5, role_name: 'ENCARGADO_SALUD' }

const MODEL: MlModel = {
  id_model: 3,
  version: 'xgb-2026-09',
  algorithm: 'xgboost',
  feature_version: 'v1',
  features: ['acwr'],
  metrics: { pr_auc: 0.31, roc_auc: 0.72, recall: 0.6, precision: 0.2, n_test: 400 },
  rules_baseline_metrics: { pr_auc: 0.22 },
  train_from: '2026-02-01',
  train_to: '2026-07-31',
  test_from: '2026-08-01',
  test_to: '2026-09-15',
  is_synthetic: true,
  is_active: false,
}

const REPORT: ValidationReport = {
  period: { from: '2026-02-01', to: '2026-10-05' },
  window_days: 7,
  fatigue_alerts: {
    total: 12,
    by_level: { alto: 2, medio: 6, bajo: 4 },
    by_status: { open: 3, reviewed: 7, dismissed: 2 },
    dismissal_rate: 22.22,
  },
  injury_risk_assessments: {
    total: 5,
    by_level: { alto: 1, medio: 4 },
    by_status: { open: 1, reviewed: 4, dismissed: 0 },
    dismissal_rate: 0,
  },
  rules_phase1: {
    non_contact_injuries: 0,
    injuries_without_mechanism: 1,
    sensitivity: { injuries: 0, preceded_by_alert: 0, sensitivity: null },
    positive_predictive_value: {
      alerts: 5,
      followed_by_injury: 0,
      positive_predictive_value: 0,
      pending_window: 1,
    },
  },
  talent: {},
  shadow_mode: null,
  definitions: { sensitivity: 'Porcentaje de lesiones sin contacto precedidas por una alerta' },
  warnings: ['Sensibilidad de la fase 1: no hay lesiones sin contacto en el periodo'],
}

function signInAs(user: User) {
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, 'refresh-guardado')
  vi.mocked(authService.refreshSession).mockResolvedValue('access-renovado')
  vi.mocked(usersService.getMe).mockResolvedValue(user)
}

async function tabNames(label: string) {
  const tabList = await screen.findByRole('tablist', { name: label })
  return within(tabList)
    .getAllByRole('tab')
    .map((tab) => tab.textContent)
}

beforeAll(async () => {
  await Promise.all([
    import('@/views/app/analytics/AnalyticsView'),
    import('@/views/app/settings/SettingsView'),
  ])
})

beforeEach(() => {
  primeAppDataMocks()
  vi.mocked(mlService.validationReport).mockResolvedValue(REPORT)
  vi.mocked(mlService.readiness).mockResolvedValue({
    ready: false,
    criteria: [],
    labeled_rows: 0,
    positive_labels: 0,
    labeled_period: { from: null, to: null },
  })
  vi.mocked(mlService.listModels).mockResolvedValue([MODEL])
  vi.mocked(configService.listOverrides).mockResolvedValue([])
  vi.mocked(configService.getActive).mockResolvedValue({
    id: 1,
    id_category: null,
    scope: 'global',
    values: { low_min: 0.8, low_max: 1.3, medium_max: 1.5 },
  })
  vi.mocked(configService.update).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
})

describe('análisis IA', () => {
  it('muestra al director técnico solo la validación, con los datos insuficientes explicados', async () => {
    signInAs(DT_USER)
    renderAppAt('/app/analisis')

    expect(await tabNames('Secciones de análisis')).toEqual(['Validación'])
    const kpis = await screen.findByRole('list', { name: 'Indicadores de validación' })
    const sensitivity = within(kpis).getByText('Sensibilidad de las reglas').closest('li')
    expect(sensitivity).toHaveTextContent('Sin datos suficientes')
    expect(within(kpis).getByText('Descarte de alertas de fatiga').closest('li')).toHaveTextContent(
      '22,2 %',
    )
    expect(screen.getByText(REPORT.warnings[0])).toBeInTheDocument()
  })

  it('no le ofrece al encargado de salud el motor ni activar modelos', async () => {
    signInAs(HEALTH_USER)
    const user = userEvent.setup()
    renderAppAt('/app/analisis')

    expect(await tabNames('Secciones de análisis')).toEqual([
      'Readiness',
      'Calidad de datos',
      'Modelos',
      'Validación',
      'Datos',
    ])
    await user.click(screen.getByRole('tab', { name: 'Modelos' }))
    expect(await screen.findByText('Sintético')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument()
  })

  it('muestra el motivo cuando el backend rechaza activar un modelo', async () => {
    vi.mocked(mlService.activateModel).mockRejectedValue(
      createApiError(400, {
        status: 'Error',
        mensaje: 'Un modelo sintético no puede activarse',
      }),
    )
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/analisis?tab=modelos')

    await user.click(await screen.findByRole('button', { name: 'Activar' }))
    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: 'Activar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Un modelo sintético no puede activarse',
    )
    expect(mlService.activateModel).toHaveBeenCalledWith(3)
  })
})

describe('configuración', () => {
  it('crea umbrales propios para una categoría que usa los globales', async () => {
    signInAs(DT_USER)
    const user = userEvent.setup()
    renderAppAt('/app/configuracion')

    expect(await tabNames('Secciones de configuración')).toEqual([
      'Umbrales de ACWR',
      'Reglas de riesgo',
      'Reglas de talento',
      'Perfiles de pesos',
    ])

    await user.click(await screen.findByRole('combobox', { name: 'Aplicar a' }))
    await user.click(await screen.findByRole('option', { name: SUB15.name }))
    expect(await screen.findByText('Usa la configuración global')).toBeInTheDocument()

    const field = await screen.findByLabelText('Límite superior de la zona segura')
    await user.clear(field)
    await user.type(field, '1,6')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(await screen.findByText(CONFIG_DEFINITIONS.acwr.rules[0].message)).toBeInTheDocument()
    expect(configService.update).not.toHaveBeenCalled()

    await user.clear(field)
    await user.type(field, '1,25')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() =>
      expect(configService.update).toHaveBeenCalledWith('acwr', SUB15.id_category, {
        low_min: 0.8,
        low_max: 1.25,
        medium_max: 1.5,
      }),
    )
  })

  it('permite al administrador cambiar el rol de una cuenta', async () => {
    vi.mocked(usersService.listAll).mockResolvedValue([ADMIN_USER, COACH_USER])
    vi.mocked(rolesService.idsByCode).mockResolvedValue({
      ADMIN: 1,
      ENTRENADOR: 2,
      DEPORTISTA: 3,
      DIRECTOR_TECNICO: 4,
      ENCARGADO_SALUD: 5,
    })
    vi.mocked(usersService.updateByAdmin).mockResolvedValue({ status: 'Success', mensaje: 'ok' })
    signInAs(ADMIN_USER)
    const user = userEvent.setup()
    renderAppAt('/app/configuracion?tab=usuarios')

    expect(
      screen.queryByRole('button', { name: 'Más acciones para Laura Gómez' }),
    ).not.toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Más acciones para Carlos Rojas' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Editar' }))
    const sheet = await screen.findByRole('dialog', { name: /Editar cuenta de Carlos Rojas/ })
    await user.click(within(sheet).getByRole('combobox', { name: 'Rol' }))
    await user.click(await screen.findByRole('option', { name: 'Director Técnico' }))
    expect(within(sheet).getByText(/cambian los módulos/)).toBeInTheDocument()
    await user.click(within(sheet).getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(usersService.updateByAdmin).toHaveBeenCalledWith(COACH_USER.id_user, {
        name: COACH_USER.name,
        lastname: COACH_USER.lastname,
        email: COACH_USER.email,
        id_role: 4,
      }),
    )
  })
})
