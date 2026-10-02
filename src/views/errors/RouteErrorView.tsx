import { TriangleAlert } from 'lucide-react'
import { StatusPage } from '@/components/common/StatusPage'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/constants/routes'

export default function RouteErrorView() {
  return (
    <StatusPage
      icon={TriangleAlert}
      title="Algo salió mal"
      description="Ocurrió un error inesperado al mostrar esta página. Recárgala para intentarlo de nuevo."
      actions={
        <>
          <Button size="lg" onClick={() => window.location.reload()}>
            Recargar la página
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={APP_ROUTES.landing}>Volver a la página principal</a>
          </Button>
        </>
      }
    />
  )
}
