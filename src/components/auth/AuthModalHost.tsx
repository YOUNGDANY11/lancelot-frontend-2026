import { LoginModal } from '@/components/auth/LoginModal'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthModal } from '@/hooks/useAuthModal'

export function AuthModalHost() {
  const { view, close } = useAuthModal()

  return (
    <Dialog open={view !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl glass p-6 sm:max-w-md">
        {view === 'register' ? <RegisterModal /> : <LoginModal />}
      </DialogContent>
    </Dialog>
  )
}
