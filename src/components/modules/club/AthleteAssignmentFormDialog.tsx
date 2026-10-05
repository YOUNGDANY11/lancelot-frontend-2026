import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { POSITION_HINT } from '@/constants/positions'
import { useAthleteAssignmentFormController } from '@/controllers/forms/useAthleteAssignmentFormController'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AthleteAssignmentContent({ onOpenChange }: Omit<DialogProps, 'open'>) {
  const controller = useAthleteAssignmentFormController({ onDone: () => onOpenChange(false) })
  const { form } = controller

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title="Asignar deportista a una categoría"
      description={
        controller.seasonName
          ? `La asignación queda en la temporada ${controller.seasonName}.`
          : 'Primero activa una temporada.'
      }
      submitLabel="Asignar"
      pendingLabel="Asignando…"
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="id_user"
          render={({ field, fieldState }) => (
            <FormField
              id="assignment-athlete"
              label="Deportista"
              description="Solo aparecen quienes aún no tienen categoría en esta temporada."
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <AthletePicker
                  {...controlProps}
                  options={controller.athleteOptions}
                  value={field.value || null}
                  onChange={(id) => field.onChange(id ?? 0)}
                  isLoading={controller.isLoadingAthletes}
                  emptyMessage="No hay deportistas pendientes por asignar con ese nombre."
                />
              )}
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="id_category"
          render={({ field, fieldState }) => (
            <FormField id="assignment-category" label="Categoría" error={fieldState.error?.message}>
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
        <Controller
          control={form.control}
          name="position"
          render={({ field, fieldState }) => (
            <FormField
              id="assignment-position"
              label="Posición"
              description={POSITION_HINT}
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  groups={controller.positionGroups}
                  placeholder="Elige la posición"
                />
              )}
            </FormField>
          )}
        />
      </FieldGroup>
    </FormModal>
  )
}

export function AthleteAssignmentFormDialog({ open, onOpenChange }: DialogProps) {
  return open ? <AthleteAssignmentContent onOpenChange={onOpenChange} /> : null
}
