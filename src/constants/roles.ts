import {
  ClipboardCheck,
  Megaphone,
  Settings,
  Shirt,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'

export const ROLE_CODES = [
  'ADMIN',
  'ENTRENADOR',
  'DEPORTISTA',
  'DIRECTOR_TECNICO',
  'ENCARGADO_SALUD',
] as const

export type RoleCode = (typeof ROLE_CODES)[number]

export const ROLE_CODE_BY_ID: Record<number, RoleCode> = {
  1: 'ADMIN',
  2: 'ENTRENADOR',
  3: 'DEPORTISTA',
  4: 'DIRECTOR_TECNICO',
  5: 'ENCARGADO_SALUD',
}

export const ROLE_LABELS: Record<RoleCode, string> = {
  ADMIN: 'Administrador',
  ENTRENADOR: 'Entrenador',
  DEPORTISTA: 'Deportista',
  DIRECTOR_TECNICO: 'Director Técnico',
  ENCARGADO_SALUD: 'Encargado de salud',
}

export const ROLE_ICONS: Record<RoleCode, LucideIcon> = {
  ADMIN: Settings,
  ENTRENADOR: Megaphone,
  DEPORTISTA: Shirt,
  DIRECTOR_TECNICO: ClipboardCheck,
  ENCARGADO_SALUD: Stethoscope,
}

export const ROLE_SUMMARIES: Record<RoleCode, string> = {
  DIRECTOR_TECNICO:
    'Planifica la temporada, ajusta umbrales y perfiles de evaluación, revisa las señalizaciones de talento y decide los ascensos.',
  ENTRENADOR:
    'Registra las sesiones y el RPE desde la cancha, sigue la carga de su equipo, los partidos y las alertas de sus deportistas.',
  DEPORTISTA:
    'Reporta su esfuerzo después de cada sesión y consulta su carga, sus evaluaciones y sus objetivos de desarrollo.',
  ENCARGADO_SALUD:
    'Revisa las alertas de riesgo, registra lesiones y condiciones de salud y gestiona los consentimientos. No tiene que ser médico titulado.',
  ADMIN:
    'Configura el club, crea las cuentas del cuerpo técnico con su rol y supervisa el motor de análisis y la calidad de los datos.',
}

export const HOME_INTROS: Record<RoleCode, string> = {
  ADMIN:
    'Configura el club, gestiona las cuentas y vigila la calidad de los datos y el motor de análisis.',
  DIRECTOR_TECNICO:
    'Así va la temporada: carga, alertas pendientes y los índices de progreso más altos.',
  ENTRENADOR:
    'Registra el RPE de tus sesiones, sigue la carga de tu plantilla y revisa a quién tiene alertas.',
  ENCARGADO_SALUD:
    'Empieza por las alertas de la noche. Después, las lesiones en curso y los consentimientos pendientes.',
  DEPORTISTA: 'Reporta qué tan dura fue tu sesión y sigue tu carga, tus objetivos y tu evolución.',
}

export const LANDING_ROLE_ORDER: RoleCode[] = [
  'DIRECTOR_TECNICO',
  'ENTRENADOR',
  'DEPORTISTA',
  'ENCARGADO_SALUD',
  'ADMIN',
]
