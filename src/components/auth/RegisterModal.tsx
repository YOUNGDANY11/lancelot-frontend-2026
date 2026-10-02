import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthModal } from '@/hooks/useAuthModal'

export function RegisterModal() {
  const { openLogin } = useAuthModal()

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Crear cuenta</DialogTitle>
        <DialogDescription>
          Crea tu cuenta de deportista para reportar tu esfuerzo y seguir tu evolución.
        </DialogDescription>
      </DialogHeader>
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        El formulario de registro se habilita en la siguiente fase.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Button variant="link" className="h-auto p-0" onClick={() => openLogin()}>
          Iniciar sesión
        </Button>
      </p>
    </>
  )
}
