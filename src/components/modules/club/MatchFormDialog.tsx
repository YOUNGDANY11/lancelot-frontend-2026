import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useMatchFormController } from '@/controllers/forms/useMatchFormController'
import type { Match } from '@/types/competition'

function MatchFormContent({ match, onClose }: { match: Match | null; onClose: () => void }) {
  const controller = useMatchFormController({ match, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar partido' : 'Programar partido'}
      description="La categoría del partido es la de la competencia elegida."
      submitLabel={controller.isEditing ? 'Guardar' : 'Programar'}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="id_competency"
          render={({ field, fieldState }) => (
            <FormField id="match-competency" label="Competencia" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.competencyOptions}
                  placeholder={
                    controller.isLoadingCompetencies
                      ? 'Cargando competencias…'
                      : 'Elige la competencia'
                  }
                  disabled={controller.isLoadingCompetencies}
                />
              )}
            </FormField>
          )}
        />
        <div className="grid grid-cols-2 gap-5">
          <FormField id="match-date" label="Fecha" error={errors.date?.message}>
            {(controlProps) => <DateField {...controlProps} {...form.register('date')} />}
          </FormField>
          <FormField id="match-time" label="Hora" error={errors.time?.message}>
            {(controlProps) => <Input {...controlProps} type="time" {...form.register('time')} />}
          </FormField>
        </div>
        <FormField id="match-location" label="Lugar" error={errors.location?.message}>
          {(controlProps) => (
            <Input
              {...controlProps}
              placeholder="Estadio municipal"
              {...form.register('location')}
            />
          )}
        </FormField>
      </FieldGroup>
    </FormModal>
  )
}

export function MatchFormDialog({
  open,
  match,
  onClose,
}: {
  open: boolean
  match: Match | null
  onClose: () => void
}) {
  return open ? (
    <MatchFormContent key={match?.id_match ?? 'nuevo'} match={match} onClose={onClose} />
  ) : null
}
