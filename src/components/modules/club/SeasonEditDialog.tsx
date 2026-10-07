import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SEASON_STATUS } from '@/constants/enums'
import { useSeasonEditFormController } from '@/controllers/forms/useSeasonEditFormController'
import type { Season } from '@/types/club'

interface SeasonEditDialogProps {
  season: Season | null
  onClose: () => void
}

function SeasonEditContent({ season, onClose }: { season: Season; onClose: () => void }) {
  const { form, onSubmit, isSubmitting, serverError } = useSeasonEditFormController({
    season,
    onDone: onClose,
  })
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Editar ${season.name}`}
      description="Para cerrar la temporada usa la acción Cerrar temporada: así confirmas la detección de talento."
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <FormAlert message={serverError} />
        <FormField id="season-edit-name" label="Nombre" error={errors.name?.message}>
          {(controlProps) => <Input {...controlProps} {...form.register('name')} />}
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            id="season-edit-start"
            label="Fecha de inicio"
            error={errors.start_date?.message}
          >
            {(controlProps) => <DateField {...controlProps} {...form.register('start_date')} />}
          </FormField>
          <FormField
            id="season-edit-end"
            label="Fecha de fin"
            optional
            error={errors.end_date?.message}
          >
            {(controlProps) => <DateField {...controlProps} {...form.register('end_date')} />}
          </FormField>
        </div>
        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <FormField id="season-edit-status" label="Estado" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={SEASON_STATUS.options
                    .filter((option) => option.value !== 'closed' || season.status === 'closed')
                    .map(({ value, label }) => ({ value, label }))}
                />
              )}
            </FormField>
          )}
        />
      </FieldGroup>
    </FormModal>
  )
}

export function SeasonEditDialog({ season, onClose }: SeasonEditDialogProps) {
  return season ? (
    <SeasonEditContent key={season.id_season} season={season} onClose={onClose} />
  ) : null
}
