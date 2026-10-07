import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { usePhysicalEvaluationFormController } from '@/controllers/forms/usePhysicalEvaluationFormController'
import type { PhysicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

interface SheetProps {
  open: boolean
  idUser: number
  evaluation: PhysicalEvaluation | null
  onClose: () => void
}

function PhysicalEvaluationContent({ idUser, evaluation, onClose }: Omit<SheetProps, 'open'>) {
  const controller = usePhysicalEvaluationFormController({ idUser, evaluation, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar evaluación física' : 'Registrar evaluación física'}
      description={controller.seasonName ? `Temporada ${controller.seasonName}.` : undefined}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="stage"
            render={({ field, fieldState }) => (
              <FormField id="physical-stage" label="Etapa" error={fieldState.error?.message}>
                {(controlProps) => (
                  <SelectInput
                    {...controlProps}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={controller.stageOptions}
                  />
                )}
              </FormField>
            )}
          />
          <FormField id="physical-date" label="Fecha" error={errors.eval_date?.message}>
            {(controlProps) => (
              <DateField {...controlProps} max={todayApiDate()} {...form.register('eval_date')} />
            )}
          </FormField>
        </div>

        <FieldSet>
          <FieldLegend variant="label">Antropometría</FieldLegend>
          <div className="grid grid-cols-2 gap-5">
            <FormField id="physical-height" label="Talla (cm)" error={errors.height_cm?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  inputMode="decimal"
                  placeholder="165"
                  {...form.register('height_cm')}
                />
              )}
            </FormField>
            <FormField id="physical-weight" label="Peso (kg)" error={errors.weight_kg?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  inputMode="decimal"
                  placeholder="58,5"
                  {...form.register('weight_kg')}
                />
              )}
            </FormField>
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label">Capacidad física</FieldLegend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              id="physical-vo2"
              label="VO₂ máx. estimado (ml/kg/min)"
              optional
              error={errors.vo2max_estimado?.message}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  inputMode="decimal"
                  {...form.register('vo2max_estimado')}
                />
              )}
            </FormField>
            <Controller
              control={form.control}
              name="test_method"
              render={({ field, fieldState }) => (
                <FormField
                  id="physical-method"
                  label="Prueba usada"
                  optional
                  error={fieldState.error?.message}
                >
                  {(controlProps) => (
                    <SelectInput
                      {...controlProps}
                      value={field.value}
                      onValueChange={field.onChange}
                      options={controller.methodOptions}
                      placeholder="Elige la prueba"
                    />
                  )}
                </FormField>
              )}
            />
          </div>
          <FormField
            id="physical-speed"
            label="Velocidad en 20 m (segundos)"
            optional
            description="Tiempo en recorrer 20 metros. Menos segundos es mejor."
            error={errors.speed_20m?.message}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                inputMode="decimal"
                placeholder="3,45"
                {...form.register('speed_20m')}
              />
            )}
          </FormField>
        </FieldSet>
      </FieldGroup>
    </FormSheet>
  )
}

export function PhysicalEvaluationFormSheet({ open, idUser, evaluation, onClose }: SheetProps) {
  return open ? (
    <PhysicalEvaluationContent
      key={evaluation?.id_eval ?? 'nueva'}
      idUser={idUser}
      evaluation={evaluation}
      onClose={onClose}
    />
  ) : null
}
