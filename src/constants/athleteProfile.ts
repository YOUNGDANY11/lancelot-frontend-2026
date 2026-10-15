import type { EvaluationDimension, Sport } from '@/constants/enums'
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
  tecnico: 'Técnica y táctica',
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

export const ATHLETE_REPORT_ROLES: RoleCode[] = ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR']

export function athleteTabsForRole(role: RoleCode | null): AthleteProfileTab[] {
  if (!role) return []
  return ATHLETE_PROFILE_TABS.filter((tab) => ATHLETE_PROFILE_TAB_ROLES[tab].includes(role))
}

export const INDICATOR_SUGGESTIONS: Record<Sport, Record<EvaluationDimension, string[]>> = {
  futbol: {
    tecnica: [
      'Control del balón',
      'Pase corto',
      'Pase largo',
      'Conducción',
      'Regate',
      'Remate',
      'Cabeceo',
      'Juego aéreo',
    ],
    tactica: [
      'Posicionamiento defensivo',
      'Marcaje',
      'Desmarque',
      'Coberturas',
      'Presión tras pérdida',
      'Transiciones',
      'Toma de decisiones',
      'Balón parado',
    ],
  },
  futbol_sala: {
    tecnica: [
      'Control con la planta',
      'Pase raso',
      'Conducción en espacio reducido',
      'Regate 1 contra 1',
      'Remate con puntera',
      'Protección del balón',
      'Juego de pies del portero',
    ],
    tactica: [
      'Rotaciones',
      'Defensa en zona',
      'Defensa individual',
      'Presión alta',
      'Juego con portero-jugador',
      'Transiciones',
      'Toma de decisiones',
      'Balón parado',
    ],
  },
}

export const ACWR_ZONE_LABELS = {
  underload: 'Destreno',
  safe: 'Zona segura',
  watch: 'Vigilancia',
  overload: 'Sobrecarga',
} as const
