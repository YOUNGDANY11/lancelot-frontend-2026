import type { FormEventHandler, ReactNode } from 'react'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  submitLabel?: string
  pendingLabel?: string
  isSubmitting: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Guardar',
  pendingLabel = 'Guardando…',
  isSubmitting,
  onSubmit,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !isSubmitting && onOpenChange(next)}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <form noValidate onSubmit={onSubmit} className="flex h-full min-h-0 flex-col">
          <SheetHeader className="border-b border-border p-5 pr-12">
            <SheetTitle className="text-lg">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
          <SheetFooter className="flex-row justify-end border-t border-border p-4">
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
