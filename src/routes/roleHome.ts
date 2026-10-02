import type { RoleCode } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/routes'

export const ROLE_HOME: Record<RoleCode, string> = {
  ADMIN: APP_ROUTES.home,
  DIRECTOR_TECNICO: APP_ROUTES.home,
  ENTRENADOR: APP_ROUTES.home,
  ENCARGADO_SALUD: APP_ROUTES.home,
  DEPORTISTA: APP_ROUTES.home,
}

export function getRoleHome(role: RoleCode | null): string {
  return role ? ROLE_HOME[role] : APP_ROUTES.home
}

export function isSafeReturnPath(path: string | undefined): path is string {
  return typeof path === 'string' && path.startsWith(`${APP_ROUTES.app}/`) && !path.startsWith('//')
}
