import { RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorState({
  title = 'No pudimos cargar esta información',
  message,
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center',
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" className="size-8 text-destructive" />
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="max-w-md text-sm text-pretty text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
          <RotateCw aria-hidden="true" className={cn(isRetrying && 'animate-spin')} />
          Reintentar
        </Button>
      )}
    </div>
  )
}
