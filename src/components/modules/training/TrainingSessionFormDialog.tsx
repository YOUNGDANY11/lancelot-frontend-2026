import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTrainingSessionFormController } from '@/controllers/forms/useTrainingSessionFormController'
import type { TrainingSession } from '@/types/training'

function SessionFormContent({
  session,
  onClose,
}: {
  session: TrainingSession | null
  onClose: () => void
}) {
  const controller = useTrainingSessionFormController({ session, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar sesión' : 'Programar sesión'}
      description={controller.seasonName ? `Temporada ${controller.seasonName}.` : undefined}
      submitLabel={controller.isEditing ? 'Guardar' : 'Programar'}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="id_category"
          render={({ field, fieldState }) => (
            <FormField id="session-category" label="Categoría" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.categoryOptions}
                  placeholder="Elige la categoría"
                />
              )}
            </FormField>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="session-date" label="Fecha" error={errors.date?.message}>
            {(controlProps) => <DateField {...controlProps} {...form.register('date')} />}
          </FormField>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <FormField id="session-type" label="Tipo" error={fieldState.error?.message}>
                {(controlProps) => (
                  <SelectInput
                    {...controlProps}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={controller.typeOptions}
                  />
                )}
              </FormField>
            )}
          />
        </div>
        <FormField
          id="session-duration"
          label="Duración planificada (minutos)"
          description="Se usa como valor inicial al registrar el RPE de cada deportista."
          error={errors.planned_duration_min?.message}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="numeric"
              {...form.register('planned_duration_min')}
            />
          )}
        </FormField>
      </FieldGroup>
    </FormModal>
  )
}

export function TrainingSessionFormDialog({
  open,
  session,
  onClose,
}: {
  open: boolean
  session: TrainingSession | null
  onClose: () => void
}) {
  return open ? (
    <SessionFormContent key={session?.id_session ?? 'nueva'} session={session} onClose={onClose} />
  ) : null
}
