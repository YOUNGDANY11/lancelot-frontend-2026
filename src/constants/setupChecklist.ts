export type SetupStepKey =
  'season' | 'categories' | 'weightProfiles' | 'staff' | 'assignments' | 'consents'

export type SetupAction =
  | 'createSeason'
  | 'activateSeason'
  | 'createCategory'
  | 'createWeightProfile'
  | 'createStaffAccount'
  | 'createAthleteAccount'
  | 'assignAthlete'
  | 'registerConsent'

export const SETUP_TEXTS = {
  title: 'Configura tu club',
  description:
    'Sigue estos pasos en orden. Cada uno se marca solo cuando Lancelot detecta que está completo.',
  progress: (done: number, total: number) => `${done} de ${total} pasos completos`,
  done: 'Completado',
  pending: 'Pendiente',
  blocked: 'Bloqueado',
  adminOnly: 'A cargo de otro rol',
} as const

export const SETUP_STEP_TITLES: Record<SetupStepKey, string> = {
  season: 'Crea la temporada y actívala',
  categories: 'Crea las categorías',
  weightProfiles: 'Crea los perfiles de pesos por posición y categoría',
  staff: 'Crea las cuentas del cuerpo técnico',
  assignments: 'Asigna los deportistas a sus categorías, con su posición',
  consents: 'Registra los consentimientos de los menores',
}

export const SETUP_ACTION_LABELS: Record<SetupAction, string> = {
  createSeason: 'Crear temporada',
  activateSeason: 'Activar temporada',
  createCategory: 'Crear categoría',
  createWeightProfile: 'Crear perfil de pesos',
  createStaffAccount: 'Crear cuenta',
  createAthleteAccount: 'Crear cuenta de deportista',
  assignAthlete: 'Asignar deportista',
  registerConsent: 'Registrar consentimiento',
}
