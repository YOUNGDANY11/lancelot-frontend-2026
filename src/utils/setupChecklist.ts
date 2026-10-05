import { SETUP_STEP_TITLES, type SetupAction, type SetupStepKey } from '@/constants/setupChecklist'
import type { RoleCode } from '@/constants/roles'
import type { AthleteAssignment, Category, ParentalConsent, Season } from '@/types/club'
import type { User } from '@/types/user'
import { isMinor } from '@/utils/age'

export type SetupStepStatus = 'done' | 'pending' | 'blocked' | 'other-role'

export interface SetupStep {
  key: SetupStepKey
  title: string
  status: SetupStepStatus
  detail: string
  action?: SetupAction
}

export interface SetupSnapshot {
  role: RoleCode
  currentUserId: number
  seasons: Season[]
  activeSeason: Season | null
  categories: Pick<Category, 'id_category' | 'name'>[]
  weightProfileCount: number
  users: User[] | null
  athletes: User[]
  assignments: AthleteAssignment[]
  grantedConsents: ParentalConsent[] | null
}

const STAFF_ROLE_NAMES = new Set(['ENTRENADOR', 'DIRECTOR_TECNICO', 'ENCARGADO_SALUD'])

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function seasonStep({ seasons, activeSeason }: SetupSnapshot): SetupStep {
  if (activeSeason) {
    return {
      key: 'season',
      title: SETUP_STEP_TITLES.season,
      status: 'done',
      detail: `Temporada activa: ${activeSeason.name}.`,
    }
  }
  const hasPlanned = seasons.some((season) => season.status === 'planned')
  return {
    key: 'season',
    title: SETUP_STEP_TITLES.season,
    status: 'pending',
    detail: hasPlanned
      ? 'Ya hay una temporada planeada, pero ninguna está activa.'
      : 'Aún no hay una temporada activa.',
    action: hasPlanned ? 'activateSeason' : 'createSeason',
  }
}

function categoriesStep({ categories }: SetupSnapshot): SetupStep {
  return {
    key: 'categories',
    title: SETUP_STEP_TITLES.categories,
    status: categories.length > 0 ? 'done' : 'pending',
    detail:
      categories.length > 0
        ? `${plural(categories.length, 'categoría creada', 'categorías creadas')}: ${categories
            .map((category) => category.name)
            .join(', ')}.`
        : 'Aún no hay categorías.',
    action: 'createCategory',
  }
}

function weightProfilesStep({ categories, weightProfileCount }: SetupSnapshot): SetupStep {
  if (categories.length === 0) {
    return {
      key: 'weightProfiles',
      title: SETUP_STEP_TITLES.weightProfiles,
      status: 'blocked',
      detail: 'Primero crea las categorías.',
    }
  }
  return {
    key: 'weightProfiles',
    title: SETUP_STEP_TITLES.weightProfiles,
    status: weightProfileCount > 0 ? 'done' : 'pending',
    detail:
      weightProfileCount > 0
        ? `${plural(weightProfileCount, 'perfil creado', 'perfiles creados')}.`
        : 'Sin perfiles no se puede calcular el índice de progreso.',
    action: 'createWeightProfile',
  }
}

function staffStep({ role, users, currentUserId }: SetupSnapshot): SetupStep {
  if (role !== 'ADMIN' || users === null) {
    return {
      key: 'staff',
      title: SETUP_STEP_TITLES.staff,
      status: 'other-role',
      detail: 'El administrador del club crea las cuentas con su rol.',
    }
  }
  const staff = users.filter(
    (user) => user.id_user !== currentUserId && STAFF_ROLE_NAMES.has(user.role_name),
  )
  return {
    key: 'staff',
    title: SETUP_STEP_TITLES.staff,
    status: staff.length > 0 ? 'done' : 'pending',
    detail:
      staff.length > 0
        ? `${plural(staff.length, 'cuenta del cuerpo técnico', 'cuentas del cuerpo técnico')}.`
        : 'Aún no hay entrenadores, directores técnicos ni encargados de salud.',
    action: 'createStaffAccount',
  }
}

function assignmentsStep(snapshot: SetupSnapshot): SetupStep {
  const { activeSeason, categories, athletes, assignments, role } = snapshot
  if (!activeSeason || categories.length === 0) {
    return {
      key: 'assignments',
      title: SETUP_STEP_TITLES.assignments,
      status: 'blocked',
      detail: 'Primero activa una temporada y crea las categorías.',
    }
  }
  if (athletes.length === 0) {
    return {
      key: 'assignments',
      title: SETUP_STEP_TITLES.assignments,
      status: 'pending',
      detail:
        'Aún no hay deportistas registrados. Pueden crear su cuenta desde la página principal.',
      action: role === 'ADMIN' ? 'createAthleteAccount' : undefined,
    }
  }
  const assignedIds = new Set(assignments.map((assignment) => assignment.id_user))
  const assigned = athletes.filter((athlete) => assignedIds.has(athlete.id_user)).length
  return {
    key: 'assignments',
    title: SETUP_STEP_TITLES.assignments,
    status: assigned === athletes.length ? 'done' : 'pending',
    detail: `${assigned} de ${plural(athletes.length, 'deportista asignado', 'deportistas asignados')} en ${activeSeason.name}.`,
    action: 'assignAthlete',
  }
}

function consentsStep({ role, athletes, grantedConsents }: SetupSnapshot): SetupStep {
  if (role !== 'ADMIN' || grantedConsents === null) {
    return {
      key: 'consents',
      title: SETUP_STEP_TITLES.consents,
      status: 'other-role',
      detail: 'El administrador o el encargado de salud registran los consentimientos.',
    }
  }
  if (athletes.length === 0) {
    return {
      key: 'consents',
      title: SETUP_STEP_TITLES.consents,
      status: 'blocked',
      detail: 'Primero deben registrarse los deportistas.',
    }
  }
  const minors = athletes.filter((athlete) => isMinor(athlete.birth_date))
  const withConsent = new Set(grantedConsents.map((consent) => consent.id_user))
  const covered = minors.filter((minor) => withConsent.has(minor.id_user)).length
  return {
    key: 'consents',
    title: SETUP_STEP_TITLES.consents,
    status: covered === minors.length ? 'done' : 'pending',
    detail:
      minors.length === 0
        ? 'No hay deportistas menores de edad registrados.'
        : `${covered} de ${plural(minors.length, 'menor', 'menores')} con consentimiento otorgado.`,
    action: 'registerConsent',
  }
}

export function buildSetupSteps(snapshot: SetupSnapshot): SetupStep[] {
  return [
    seasonStep(snapshot),
    categoriesStep(snapshot),
    weightProfilesStep(snapshot),
    staffStep(snapshot),
    assignmentsStep(snapshot),
    consentsStep(snapshot),
  ]
}

export function summarizeSetup(steps: SetupStep[]) {
  const verifiable = steps.filter((step) => step.status !== 'other-role')
  const done = verifiable.filter((step) => step.status === 'done').length
  return { done, total: verifiable.length, isComplete: done === verifiable.length }
}
