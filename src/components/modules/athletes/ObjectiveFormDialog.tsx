import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useObjectiveFormController } from '@/controllers/forms/useObjectiveFormController'
import type { DevelopmentObjective } from '@/types/athlete'

interface DialogProps {
  open: boolean
  idUser: number
  objective: DevelopmentObjective | null
  onClose: () => void
}

function ObjectiveFormContent({ idUser, objective, onClose }: Omit<DialogProps, 'open'>) {
  const controller = useObjectiveFormController({ idUser, objective, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar objetivo' : 'Crear objetivo de desarrollo'}
      description={controller.seasonName ? `Temporada ${controller.seasonName}.` : undefined}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <FormField
          id="objective-description"
          label="Objetivo"
          description="Algo concreto y medible, por ejemplo: bajar a 3,3 s en la prueba de 20 m."
          error={errors.description?.message}
        >
          {(controlProps) => (
            <Textarea {...controlProps} rows={3} autoFocus {...form.register('description')} />
          )}
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="objective-target" label="Fecha meta" error={errors.target_date?.message}>
            {(controlProps) => <DateField {...controlProps} {...form.register('target_date')} />}
          </FormField>
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <FormField id="objective-status" label="Estado" error={fieldState.error?.message}>
                {(controlProps) => (
                  <SelectInput
                    {...controlProps}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={controller.statusOptions}
                  />
                )}
              </FormField>
            )}
          />
        </div>
      </FieldGroup>
    </FormModal>
  )
}

export function ObjectiveFormDialog({ open, ...props }: DialogProps) {
  return open ? (
    <ObjectiveFormContent key={props.objective?.id_objective ?? 'nuevo'} {...props} />
  ) : null
}
