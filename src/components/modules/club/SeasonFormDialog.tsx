import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSeasonFormController } from '@/controllers/forms/useSeasonFormController'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function SeasonFormContent({ onOpenChange }: Omit<DialogProps, 'open'>) {
  const { form, onSubmit, isSubmitting, serverError } = useSeasonFormController({
    onDone: () => onOpenChange(false),
  })
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title="Crear temporada"
      description="La temporada activa es el contexto por defecto de toda la plataforma."
      submitLabel="Crear temporada"
      pendingLabel="Creando…"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <FormAlert message={serverError} />
        <FormField id="season-name" label="Nombre" error={errors.name?.message}>
          {(controlProps) => (
            <Input
              {...controlProps}
              placeholder="Temporada 2026"
              autoFocus
              {...form.register('name')}
            />
          )}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="season-start" label="Fecha de inicio" error={errors.start_date?.message}>
            {(controlProps) => <DateField {...controlProps} {...form.register('start_date')} />}
          </FormField>
          <FormField id="season-end" label="Fecha de fin" optional error={errors.end_date?.message}>
            {(controlProps) => <DateField {...controlProps} {...form.register('end_date')} />}
          </FormField>
        </div>
        <Controller
          control={form.control}
          name="activateNow"
          render={({ field }) => (
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Checkbox
                id="season-activate"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor="season-activate">Activarla ahora</Label>
                <p className="text-sm text-muted-foreground">
                  Si no la activas, queda como planeada y la puedes activar después.
                </p>
              </div>
            </div>
          )}
        />
      </FieldGroup>
    </FormModal>
  )
}

export function SeasonFormDialog({ open, onOpenChange }: DialogProps) {
  return open ? <SeasonFormContent onOpenChange={onOpenChange} /> : null
}
