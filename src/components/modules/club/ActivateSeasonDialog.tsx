import { Controller } from 'react-hook-form'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { useActivateSeasonController } from '@/controllers/forms/useSeasonFormController'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ActivateSeasonContent({ onOpenChange }: Omit<DialogProps, 'open'>) {
  const { form, options, onSubmit, isSubmitting, serverError } = useActivateSeasonController({
    onDone: () => onOpenChange(false),
  })

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title="Activar temporada"
      description="La temporada activa es la que verán por defecto todas las personas del club."
      submitLabel="Activar"
      pendingLabel="Activando…"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <FormAlert message={serverError} />
        <Controller
          control={form.control}
          name="id_season"
          render={({ field, fieldState }) => (
            <FormField id="activate-season" label="Temporada" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={options}
                  placeholder="Elige una temporada planeada"
                />
              )}
            </FormField>
          )}
        />
      </FieldGroup>
    </FormModal>
  )
}

export function ActivateSeasonDialog({ open, onOpenChange }: DialogProps) {
  return open ? <ActivateSeasonContent onOpenChange={onOpenChange} /> : null
}
