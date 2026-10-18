import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { EvaluationDimension } from '@/constants/enums'
import { useTechnicalEvaluationFormController } from '@/controllers/forms/useTechnicalEvaluationFormController'
import type { TechnicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

interface DialogProps {
  open: boolean
  idUser: number
  evaluation: TechnicalEvaluation | null
  defaultDimension?: EvaluationDimension
  onClose: () => void
}

function TechnicalEvaluationContent({
  idUser,
  evaluation,
  defaultDimension,
  onClose,
}: Omit<DialogProps, 'open'>) {
  const controller = useTechnicalEvaluationFormController({
    idUser,
    evaluation,
    defaultDimension,
    onDone: onClose,
  })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={
        controller.isEditing
          ? 'Editar evaluación técnico-táctica'
          : 'Registrar evaluación técnico-táctica'
      }
      description={controller.seasonName ? `Temporada ${controller.seasonName}.` : undefined}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError ?? controller.catalogError} />
        <Controller
          control={form.control}
          name="dimension"
          render={({ field, fieldState }) => (
            <FormField
              id="technical-dimension"
              label="Dimensión"
              description="Técnica: dominio del balón. Táctica: comprensión del juego."
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={controller.changeDimension}
                  options={controller.dimensionOptions}
                />
              )}
            </FormField>
          )}
        />
        <Controller
          control={form.control}
          name="indicator"
          render={({ field, fieldState }) => (
            <FormField id="technical-indicator" label="Indicador" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  options={controller.indicatorOptions}
                  disabled={controller.isCatalogLoading}
                  placeholder={
                    controller.isCatalogLoading ? 'Cargando indicadores…' : 'Elige el indicador'
                  }
                />
              )}
            </FormField>
          )}
        />
        <div className="grid grid-cols-2 gap-5">
          <FormField id="technical-score" label="Puntaje (1 a 10)" error={errors.score?.message}>
            {(controlProps) => (
              <Input
                {...controlProps}
                inputMode="decimal"
                placeholder="7,5"
                {...form.register('score')}
              />
            )}
          </FormField>
          <FormField id="technical-date" label="Fecha" error={errors.eval_date?.message}>
            {(controlProps) => (
              <DateField {...controlProps} max={todayApiDate()} {...form.register('eval_date')} />
            )}
          </FormField>
        </div>
      </FieldGroup>
    </FormModal>
  )
}

export function TechnicalEvaluationFormDialog({ open, ...props }: DialogProps) {
  return open ? (
    <TechnicalEvaluationContent key={props.evaluation?.id_eval_tech ?? 'nueva'} {...props} />
  ) : null
}
