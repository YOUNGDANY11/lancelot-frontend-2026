import { History } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { POSITION_HINT } from '@/constants/positions'
import { useAssignmentChangeFormController } from '@/controllers/forms/useAssignmentChangeFormController'
import type { AthleteAssignment } from '@/types/club'

function AssignmentChangeContent({
  assignment,
  onClose,
}: {
  assignment: AthleteAssignment
  onClose: () => void
}) {
  const controller = useAssignmentChangeFormController({ assignment, onDone: onClose })
  const { form } = controller

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Cambiar de categoría a ${controller.athleteName}`}
      description={
        controller.currentCategory ? `Categoría actual: ${controller.currentCategory}.` : undefined
      }
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <p className="flex gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
          <History aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          Las evaluaciones, la carga y las temporadas anteriores se conservan en la ficha del
          deportista (pestaña Evolución).
        </p>
        <Controller
          control={form.control}
          name="id_category"
          render={({ field, fieldState }) => (
            <FormField
              id="change-category"
              label="Nueva categoría"
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.categoryOptions}
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
              id="change-position"
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

export function AssignmentChangeDialog({
  assignment,
  onClose,
}: {
  assignment: AthleteAssignment | null
  onClose: () => void
}) {
  return assignment ? (
    <AssignmentChangeContent
      key={assignment.id_ath_cat}
      assignment={assignment}
      onClose={onClose}
    />
  ) : null
}
