import {
  Activity,
  BrainCircuit,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Shield,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { RoleCode } from '@/constants/roles'

export type ModuleKey =
  'home' | 'club' | 'athletes' | 'training' | 'health' | 'talent' | 'analytics' | 'settings'

export interface AppModule {
  key: ModuleKey
  path: string
  label: string
  description: string
  icon: LucideIcon
  roles: RoleCode[]
  labelByRole?: Partial<Record<RoleCode, string>>
}

const STAFF: RoleCode[] = ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR', 'ENCARGADO_SALUD']

export const APP_MODULES: Record<ModuleKey, AppModule> = {
  home: {
    key: 'home',
    path: '/app/inicio',
    label: 'Inicio',
    description: 'Lo que necesitas hacer hoy.',
    icon: LayoutDashboard,
    roles: [...STAFF, 'DEPORTISTA'],
    labelByRole: { DEPORTISTA: 'Mi espacio' },
  },
  club: {
    key: 'club',
    path: '/app/club',
    label: 'Club',
    description: 'Temporadas, categorías, competencias, partidos y plantilla.',
    icon: Shield,
    roles: STAFF,
  },
  athletes: {
    key: 'athletes',
    path: '/app/deportistas',
    label: 'Deportistas',
    description: 'Directorio y ficha 360° de cada deportista.',
    icon: Users,
    roles: [...STAFF, 'DEPORTISTA'],
    labelByRole: { DEPORTISTA: 'Mi ficha' },
  },
  training: {
    key: 'training',
    path: '/app/entrenamiento',
    label: 'Entrenamiento',
    description: 'Sesiones, RPE, partidos y carga del equipo.',
    icon: Activity,
    roles: [...STAFF, 'DEPORTISTA'],
    labelByRole: { DEPORTISTA: 'Mi entrenamiento' },
  },
  health: {
    key: 'health',
    path: '/app/salud',
    label: 'Salud',
    description: 'Alertas, lesiones, registros de salud y consentimientos.',
    icon: HeartPulse,
    roles: STAFF,
  },
  talent: {
    key: 'talent',
    path: '/app/talento',
    label: 'Talento y progreso',
    description: 'Índice de progreso y señalizaciones de talento.',
    icon: TrendingUp,
    roles: ['ADMIN', 'DIRECTOR_TECNICO', 'ENTRENADOR'],
  },
  analytics: {
    key: 'analytics',
    path: '/app/analisis',
    label: 'Análisis IA',
    description: 'Motor de análisis, calidad de datos y validación.',
    icon: BrainCircuit,
    roles: ['ADMIN', 'DIRECTOR_TECNICO', 'ENCARGADO_SALUD'],
  },
  settings: {
    key: 'settings',
    path: '/app/configuracion',
    label: 'Configuración',
    description: 'Umbrales, perfiles de pesos y usuarios.',
    icon: Settings,
    roles: ['ADMIN', 'DIRECTOR_TECNICO'],
  },
}

export const SIDEBAR_MODULE_ORDER: ModuleKey[] = [
  'home',
  'club',
  'athletes',
  'training',
  'health',
  'talent',
  'analytics',
]

export const MOBILE_PRIMARY_COUNT = 4

export function modulesForRole(role: RoleCode | null): AppModule[] {
  if (!role) return []
  return SIDEBAR_MODULE_ORDER.map((key) => APP_MODULES[key]).filter((module) =>
    module.roles.includes(role),
  )
}

export function moduleLabel(module: AppModule, role: RoleCode | null): string {
  return (role && module.labelByRole?.[role]) || module.label
}

export function canAccessModule(key: ModuleKey, role: RoleCode | null): boolean {
  return role !== null && APP_MODULES[key].roles.includes(role)
}
