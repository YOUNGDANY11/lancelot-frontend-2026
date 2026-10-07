import { TriangleAlert } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { SelectInput } from '@/components/common/SelectInput'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useHealthRecordFormController } from '@/controllers/forms/useHealthRecordFormController'
import type { HealthRecord } from '@/types/athlete'

interface HealthRecordFormSheetProps {
  open: boolean
  record: HealthRecord | null
  onClose: () => void
}

function HealthRecordFormContent({
  record,
  onClose,
}: {
  record: HealthRecord | null
  onClose: () => void
}) {
  const controller = useHealthRecordFormController({ record, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar registro de salud' : 'Nuevo registro de salud'}
      description={
        controller.isEditing
          ? controller.athleteName
          : 'Condiciones, alergias o restricciones que el cuerpo técnico debe conocer.'
      }
      submitLabel={controller.isEditing ? 'Guardar' : 'Crear registro'}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        {!controller.isEditing && (
          <Controller
            control={form.control}
            name="id_user"
            render={({ field, fieldState }) => (
              <FormField id="record-athlete" label="Deportista" error={fieldState.error?.message}>
                {(controlProps) => (
                  <AthletePicker
                    {...controlProps}
                    options={controller.athleteOptions}
                    value={field.value || null}
                    onChange={(id) => field.onChange(id ?? 0)}
                    isLoading={controller.isLoadingAthletes}
                  />
                )}
              </FormField>
            )}
          />
        )}
        {controller.selectedNeedsConsent && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
            Es menor de edad y no tiene consentimiento del acudiente otorgado. Regístralo primero en
            la pestaña Consentimientos (Ley 1581 de 2012).
          </p>
        )}
        <FormField
          id="record-condition"
          label="Tipo de condición"
          error={errors.condition_type?.message}
        >
          {(controlProps) => (
            <>
              <Input
                {...controlProps}
                list="record-conditions"
                autoComplete="off"
                placeholder="Por ejemplo, Asma"
                {...form.register('condition_type')}
              />
              <datalist id="record-conditions">
                {controller.conditionSuggestions.map((condition) => (
                  <option key={condition} value={condition} />
                ))}
              </datalist>
            </>
          )}
        </FormField>
        <FormField id="record-description" label="Descripción" error={errors.description?.message}>
          {(controlProps) => (
            <Textarea {...controlProps} rows={4} {...form.register('description')} />
          )}
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <FormField id="record-status" label="Estado" error={fieldState.error?.message}>
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
          <Controller
            control={form.control}
            name="restriction"
            render={({ field }) => (
              <div className="flex items-start gap-3 self-end rounded-lg border border-border p-3">
                <Checkbox
                  id="record-restriction"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="record-restriction">Limita la actividad</Label>
                  <p className="text-xs text-muted-foreground">
                    Márcalo si el deportista no puede entrenar con normalidad.
                  </p>
                </div>
              </div>
            )}
          />
        </div>
      </FieldGroup>
    </FormSheet>
  )
}

export function HealthRecordFormSheet({ open, record, onClose }: HealthRecordFormSheetProps) {
  return open ? <HealthRecordFormContent record={record} onClose={onClose} /> : null
}
