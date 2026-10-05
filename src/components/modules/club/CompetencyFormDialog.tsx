import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCompetencyFormController } from '@/controllers/forms/useCompetencyFormController'
import type { Competency } from '@/types/competition'

interface CompetencyFormDialogProps {
  open: boolean
  competency: Competency | null
  onClose: () => void
}

function CompetencyFormContent({
  competency,
  onClose,
}: {
  competency: Competency | null
  onClose: () => void
}) {
  const controller = useCompetencyFormController({ competency, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? `Editar ${competency?.name}` : 'Crear competencia'}
      description={
        controller.seasonName
          ? `Torneo o liga de la temporada ${controller.seasonName}.`
          : 'Selecciona una temporada en la barra superior.'
      }
      submitLabel={controller.isEditing ? 'Guardar' : 'Crear competencia'}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <FormField id="competency-name" label="Nombre" error={errors.name?.message}>
          {(controlProps) => (
            <Input
              {...controlProps}
              placeholder="Liga departamental"
              autoFocus
              {...form.register('name')}
            />
          )}
        </FormField>
        <Controller
          control={form.control}
          name="id_category"
          render={({ field, fieldState }) => (
            <FormField id="competency-category" label="Categoría" error={fieldState.error?.message}>
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
          <FormField
            id="competency-start"
            label="Fecha de inicio"
            error={errors.start_date?.message}
          >
            {(controlProps) => <DateField {...controlProps} {...form.register('start_date')} />}
          </FormField>
          <FormField
            id="competency-finish"
            label="Fecha de fin"
            optional
            error={errors.finish?.message}
          >
            {(controlProps) => <DateField {...controlProps} {...form.register('finish')} />}
          </FormField>
        </div>
        <FormField
          id="competency-description"
          label="Descripción"
          optional
          error={errors.description?.message}
        >
          {(controlProps) => (
            <Textarea {...controlProps} rows={3} {...form.register('description')} />
          )}
        </FormField>
      </FieldGroup>
    </FormModal>
  )
}

export function CompetencyFormDialog({ open, competency, onClose }: CompetencyFormDialogProps) {
  return open ? (
    <CompetencyFormContent
      key={competency?.id_competency ?? 'nueva'}
      competency={competency}
      onClose={onClose}
    />
  ) : null
}
