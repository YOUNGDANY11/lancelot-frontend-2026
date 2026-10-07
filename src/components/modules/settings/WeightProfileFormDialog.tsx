import { Controller } from 'react-hook-form'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { HelpHint } from '@/components/common/HelpHint'
import { SelectInput } from '@/components/common/SelectInput'
import { WeightDistributionBar } from '@/components/modules/settings/WeightDistributionBar'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { POSITION_HINT } from '@/constants/positions'
import { useWeightProfileFormController } from '@/controllers/forms/useWeightProfileFormController'
import type { PositionWeightProfile } from '@/types/club'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile?: PositionWeightProfile | null
}

const WEIGHT_FIELDS = [
  { name: 'w_physical', label: 'Física (%)' },
  { name: 'w_technical', label: 'Técnica (%)' },
  { name: 'w_participation', label: 'Participación (%)' },
] as const

function WeightProfileContent({ onOpenChange, profile }: Omit<DialogProps, 'open'>) {
  const controller = useWeightProfileFormController({
    onDone: () => onOpenChange(false),
    profile,
  })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title={controller.isEditing ? 'Editar perfil de pesos' : 'Crear perfil de pesos'}
      description="Define cuánto pesa cada dimensión en el índice de progreso de una posición y categoría."
      submitLabel={controller.isEditing ? 'Guardar' : 'Crear perfil'}
      pendingLabel={controller.isEditing ? 'Guardando…' : 'Creando…'}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          ¿Qué es un perfil de pesos?
          <HelpHint term="weightProfile" />
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="position"
            render={({ field, fieldState }) => (
              <FormField id="profile-position" label="Posición" error={fieldState.error?.message}>
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
          <Controller
            control={form.control}
            name="age_category"
            render={({ field, fieldState }) => (
              <FormField id="profile-category" label="Categoría" error={fieldState.error?.message}>
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
        </div>
        <p className="text-sm text-muted-foreground">{POSITION_HINT}</p>
        <div className="grid grid-cols-3 gap-3">
          {WEIGHT_FIELDS.map((weightField) => (
            <FormField
              key={weightField.name}
              id={`profile-${weightField.name}`}
              label={weightField.label}
              error={errors[weightField.name]?.message}
            >
              {(controlProps) => (
                <Input {...controlProps} inputMode="numeric" {...form.register(weightField.name)} />
              )}
            </FormField>
          ))}
        </div>
        <WeightDistributionBar
          physical={controller.weights.physical}
          technical={controller.weights.technical}
          participation={controller.weights.participation}
          total={controller.total}
        />
      </FieldGroup>
    </FormModal>
  )
}

export function WeightProfileFormDialog({ open, onOpenChange, profile }: DialogProps) {
  return open ? <WeightProfileContent onOpenChange={onOpenChange} profile={profile} /> : null
}
