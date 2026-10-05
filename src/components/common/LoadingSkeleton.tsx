import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type SkeletonVariant = 'cards' | 'list' | 'table'

interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  rows?: number
  label?: string
  className?: string
}

export function LoadingSkeleton({
  variant = 'list',
  rows = 4,
  label = 'Cargando…',
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: rows }, (_, index) => index)

  return (
    <div role="status" aria-live="polite" className={cn('w-full', className)}>
      <span className="sr-only">{label}</span>
      {variant === 'cards' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Skeleton key={item} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}
      {variant === 'list' && (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Skeleton key={item} className="h-16 rounded-xl" />
          ))}
        </div>
      )}
      {variant === 'table' && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 rounded-lg" />
          {items.map((item) => (
            <Skeleton key={item} className="h-12 rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}
