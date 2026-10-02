import { Navigate } from 'react-router'
import { useRole } from '@/hooks/useRole'
import { getRoleHome } from '@/routes/roleHome'

export function RoleHomeRedirect() {
  const { role } = useRole()
  return <Navigate to={getRoleHome(role)} replace />
}
