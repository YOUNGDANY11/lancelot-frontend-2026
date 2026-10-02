import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router'
import { StatusPage } from '@/components/common/StatusPage'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/constants/routes'

export default function NotFoundView() {
  return (
    <StatusPage
      icon={MapPinOff}
      code="Error 404"
      title="No encontramos esta página"
      description="Puede que el enlace esté mal escrito o que la página ya no exista."
      actions={
        <>
          <Button asChild size="lg">
            <Link to={APP_ROUTES.app}>Ir a mi inicio</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={APP_ROUTES.landing}>Volver a la página principal</Link>
          </Button>
        </>
      }
    />
  )
}
