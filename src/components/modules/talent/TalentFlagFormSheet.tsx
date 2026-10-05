import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useTalentFlagFormController } from '@/controllers/forms/useTalentFlagFormController'

interface TalentFlagFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TalentFlagFormContent({ onOpenChange }: Omit<TalentFlagFormSheetProps, 'open'>) {
  const controller = useTalentFlagFormController({ onDone: () => onOpenChange(false) })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title="Señalización manual"
      description={`Registra lo que observas en ${controller.seasonName ?? 'la temporada'}. Queda pendiente de revisión como cualquier otra señalización.`}
      submitLabel="Registrar"
      pendingLabel="Registrando…"
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="id_user"
          render={({ field, fieldState }) => (
            <FormField id="flag-athlete" label="Deportista" error={fieldState.error?.message}>
              {(controlProps) => (
                <AthletePicker
                  {...controlProps}
                  options={controller.athleteOptions}
                  value={field.value || null}
                  onChange={(id) => field.onChange(id ?? 0)}
                  isLoading={controller.isLoadingAthletes}
                  emptyMessage="No hay deportistas con ese nombre en la plantilla de la temporada."
                />
              )}
            </FormField>
          )}
        />
        <FormField
          id="flag-criteria"
          label="Criterios observados"
          description="Por ejemplo: lectura de juego superior a su categoría y constancia en los entrenamientos."
          error={errors.criteria?.message}
        >
          {(controlProps) => <Textarea {...controlProps} rows={4} {...form.register('criteria')} />}
        </FormField>
        <FormField
          id="flag-action"
          label="Acción recomendada"
          description="Por ejemplo: entrenar una semana con la categoría superior."
          error={errors.recommended_action?.message}
        >
          {(controlProps) => (
            <Textarea {...controlProps} rows={3} {...form.register('recommended_action')} />
          )}
        </FormField>
      </FieldGroup>
    </FormSheet>
  )
}

export function TalentFlagFormSheet({ open, onOpenChange }: TalentFlagFormSheetProps) {
  return open ? <TalentFlagFormContent onOpenChange={onOpenChange} /> : null
}
