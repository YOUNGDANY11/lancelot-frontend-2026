import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { POSITION_HINT } from '@/constants/positions'
import { useAthleteAssignmentFormController } from '@/controllers/forms/useAthleteAssignmentFormController'
import type { Season } from '@/types/club'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  season?: Season | null
}

function AthleteAssignmentContent({ onOpenChange, season }: Omit<DialogProps, 'open'>) {
  const controller = useAthleteAssignmentFormController({
    onDone: () => onOpenChange(false),
    season,
  })
  const { form } = controller

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title="Agregar deportista a una categoría"
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
              description="Puede estar en varias categorías a la vez: la suya y las superiores."
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <AthletePicker
                  {...controlProps}
                  options={controller.athleteOptions}
                  value={field.value || null}
                  onChange={(id) => (id ? controller.onAthleteChange(id) : field.onChange(0))}
                  isLoading={controller.isLoadingAthletes}
                  emptyMessage="No encontramos deportistas con ese nombre."
                />
              )}
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="id_category"
          render={({ field, fieldState }) => (
            <FormField
              id="assignment-category"
              label="Categoría"
              description={controller.categoryHint}
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.categoryOptions}
                  placeholder="Elige la categoría"
                  disabled={controller.categoryOptions.length === 0}
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

export function AthleteAssignmentFormDialog({ open, onOpenChange, season }: DialogProps) {
  return open ? <AthleteAssignmentContent onOpenChange={onOpenChange} season={season} /> : null
}
