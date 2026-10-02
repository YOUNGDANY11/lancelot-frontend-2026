import type { ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

export interface FormControlProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  id: string
  label: string
  error?: string
  description?: ReactNode
  optional?: boolean
  children: (controlProps: FormControlProps) => ReactNode
}

export function FormField({ id, label, error, description, optional, children }: FormFieldProps) {
  const descriptionId = description ? `${id}-ayuda` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </FieldLabel>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  )
}
