import { lazy, Suspense } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthModal } from '@/hooks/useAuthModal'

const AuthDialogContent = lazy(() => import('@/components/auth/AuthDialogContent'))

function AuthDialogSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-4">
      <DialogTitle className="sr-only">Cargando…</DialogTitle>
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

export function AuthModalHost() {
  const { view, prefilledEmail, close } = useAuthModal()

  return (
    <Dialog open={view !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl glass p-6 sm:max-w-md">
        {view && (
          <Suspense fallback={<AuthDialogSkeleton />}>
            <AuthDialogContent view={view} prefilledEmail={prefilledEmail} />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
}
