import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthModal } from '@/hooks/useAuthModal'

export function LoginModal() {
  const { openRegister } = useAuthModal()

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Iniciar sesión</DialogTitle>
        <DialogDescription>Ingresa con el correo y la contraseña de tu cuenta.</DialogDescription>
      </DialogHeader>
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        El formulario de inicio de sesión se habilita en la siguiente fase.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{' '}
        <Button variant="link" className="h-auto p-0" onClick={openRegister}>
          Crear cuenta
        </Button>
      </p>
    </>
  )
}
