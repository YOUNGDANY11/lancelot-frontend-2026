import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, 'type'> {
  pending: boolean
  pendingLabel?: string
}

export function SubmitButton({
  pending,
  pendingLabel,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  )
}
