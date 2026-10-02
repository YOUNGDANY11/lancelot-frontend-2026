import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type DateFieldProps = Omit<ComponentProps<typeof Input>, 'type'>

export function DateField({ className, ...props }: DateFieldProps) {
  return (
    <Input
      type="date"
      className={cn('[color-scheme:light] dark:[color-scheme:dark]', className)}
      {...props}
    />
  )
}
