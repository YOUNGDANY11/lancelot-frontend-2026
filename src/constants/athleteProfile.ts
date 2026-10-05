import type { RoleCode } from '@/constants/roles'

export const ATHLETE_PROFILE_TABS = [
  'resumen',
  'fisico',
  'tecnico',
  'carga',
  'salud',
  'objetivos',
  'evolucion',
] as const

export type AthleteProfileTab = (typeof ATHLETE_PROFILE_TABS)[number]

export const ATHLETE_PROFILE_TAB_LABELS: Record<AthleteProfileTab, string> = {
  resumen: 'Resumen',
  fisico: 'Físico',
  tecnico: 'Técnico',
  carga: 'Carga',
  salud: 'Salud',
  objetivos: 'Objetivos',
  evolucion: 'Evolución',
}

export const ATHLETE_PROFILE_TAB_ROLES: Record<AthleteProfileTab, RoleCode[]> = {
  resumen: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR'],
  fisico: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'DEPORTISTA'],
  tecnico: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'DEPORTISTA'],
  carga: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'ENCARGADO_SALUD', 'DEPORTISTA'],
  salud: ['ADMIN', 'ENTRENADOR', 'ENCARGADO_SALUD'],
  objetivos: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'DEPORTISTA'],
  evolucion: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'DEPORTISTA'],
}

export function athleteTabsForRole(role: RoleCode | null): AthleteProfileTab[] {
  if (!role) return []
  return ATHLETE_PROFILE_TABS.filter((tab) => ATHLETE_PROFILE_TAB_ROLES[tab].includes(role))
}

export const TECHNICAL_INDICATOR_SUGGESTIONS = [
  'Control del balón',
  'Pase corto',
  'Pase largo',
  'Conducción',
  'Regate',
  'Remate',
  'Cabeceo',
  'Marcaje',
  'Toma de decisiones',
  'Juego aéreo',
]

export const ACWR_ZONE_LABELS = {
  underload: 'Destreno',
  safe: 'Zona segura',
  watch: 'Vigilancia',
  overload: 'Sobrecarga',
} as const
