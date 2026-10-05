import { useId } from 'react'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTechnicalEvaluationFormController } from '@/controllers/forms/useTechnicalEvaluationFormController'
import type { TechnicalEvaluation } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

interface DialogProps {
  open: boolean
  idUser: number
  evaluation: TechnicalEvaluation | null
  knownIndicators: string[]
  onClose: () => void
}

function TechnicalEvaluationContent({
  idUser,
  evaluation,
  knownIndicators,
  onClose,
}: Omit<DialogProps, 'open'>) {
  const controller = useTechnicalEvaluationFormController({
    idUser,
    evaluation,
    knownIndicators,
    onDone: onClose,
  })
  const { form } = controller
  const { errors } = form.formState
  const suggestionsId = useId()

  return (
    <FormModal
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar evaluación técnica' : 'Registrar evaluación técnica'}
      description={controller.seasonName ? `Temporada ${controller.seasonName}.` : undefined}
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <FormField
          id="technical-indicator"
          label="Indicador"
          description="Escribe o elige una habilidad. Usa siempre el mismo nombre para ver su evolución."
          error={errors.indicator?.message}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              list={suggestionsId}
              autoComplete="off"
              autoFocus
              {...form.register('indicator')}
            />
          )}
        </FormField>
        <datalist id={suggestionsId}>
          {controller.indicatorSuggestions.map((indicator) => (
            <option key={indicator} value={indicator} />
          ))}
        </datalist>
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
