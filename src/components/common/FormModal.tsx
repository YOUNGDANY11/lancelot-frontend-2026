import type { FormEventHandler, ReactNode } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  pendingLabel?: string
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  size?: 'md' | 'lg'
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Guardar',
  pendingLabel = 'Guardando…',
  isSubmitting,
  onSubmit,
  children,
  size = 'md',
}: FormModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <DialogContent
        className={
          size === 'lg'
            ? 'flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl'
            : 'flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg'
        }
      >
        <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-border p-5 pr-12">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          <DialogFooter className="m-0 rounded-none border-t border-border bg-transparent p-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <SubmitButton pending={isSubmitting} pendingLabel={pendingLabel}>
              {submitLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
