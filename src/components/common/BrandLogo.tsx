import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="font-heading text-xl font-semibold tracking-tight">Lancelot</span>
    </span>
  )
}
