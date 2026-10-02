import { Navigate, Outlet } from 'react-router'
import type { RoleCode } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/routes'
import { useRole } from '@/hooks/useRole'

interface RoleGuardProps {
  allow: RoleCode[]
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const { hasRole } = useRole()
  if (!hasRole(...allow)) return <Navigate to={APP_ROUTES.forbidden} replace />
  return <Outlet />
}
