import { ShieldX } from 'lucide-react'
import { Link } from 'react-router'
import { StatusPage } from '@/components/common/StatusPage'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/constants/routes'

export default function ForbiddenView() {
  return (
    <StatusPage
      icon={ShieldX}
      code="Error 403"
      title="No tienes permiso para ver esta página"
      description="Tu rol no tiene acceso a esta sección. Si crees que es un error, habla con el administrador del club."
      actions={
        <Button asChild size="lg">
          <Link to={APP_ROUTES.app}>Ir a mi inicio</Link>
        </Button>
      }
    />
  )
}
