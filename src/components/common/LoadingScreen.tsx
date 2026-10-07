import { Skeleton } from '@/components/ui/skeleton'

interface LoadingScreenProps {
  label?: string
}

export function LoadingScreen({ label = 'Cargando…' }: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[60dvh] w-full max-w-3xl flex-col gap-4 px-4 py-10"
    >
      <span className="sr-only">{label}</span>
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}
