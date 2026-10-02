import isotypeUrl from '@/assets/brand/isotype.svg'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  showWordmark?: boolean
}

export function BrandLogo({ className, showWordmark = true }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="font-heading text-xl font-semibold tracking-tight">Lancelot</span>
    </span>
  )
}
