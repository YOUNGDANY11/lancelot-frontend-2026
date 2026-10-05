import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { SelectInput } from '@/components/common/SelectInput'
import { MechanismChoice } from '@/components/modules/health/MechanismChoice'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useInjuryFormController } from '@/controllers/forms/useInjuryFormController'
import type { Injury } from '@/types/athlete'
import { todayApiDate } from '@/utils/formatDate'

interface InjuryFormSheetProps {
  open: boolean
  injury: Injury | null
  onClose: () => void
}

function InjuryFormContent({ injury, onClose }: { injury: Injury | null; onClose: () => void }) {
  const controller = useInjuryFormController({ injury, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={controller.isEditing ? 'Editar lesión' : 'Registrar lesión'}
      description={
        controller.isEditing
          ? controller.athleteName
          : 'Si indicas la fecha de recuperación, los días de baja se calculan solos.'
      }
      submitLabel={controller.isEditing ? 'Guardar' : 'Registrar'}
      pendingLabel={controller.isEditing ? 'Guardando…' : 'Registrando…'}
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
              <FormField id="injury-athlete" label="Deportista" error={fieldState.error?.message}>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="injury-date"
            label="Fecha de la lesión"
            error={errors.injury_date?.message}
          >
            {(controlProps) => (
              <DateField {...controlProps} max={todayApiDate()} {...form.register('injury_date')} />
            )}
          </FormField>
          <FormField
            id="injury-body-part"
            label="Zona del cuerpo"
            error={errors.body_part?.message}
          >
            {(controlProps) => (
              <>
                <Input
                  {...controlProps}
                  list="injury-body-parts"
                  autoComplete="off"
                  placeholder="Por ejemplo, Tobillo"
                  {...form.register('body_part')}
                />
                <datalist id="injury-body-parts">
                  {controller.bodyPartSuggestions.map((part) => (
                    <option key={part} value={part} />
                  ))}
                </datalist>
              </>
            )}
          </FormField>
        </div>
        <Controller
          control={form.control}
          name="mechanism"
          render={({ field, fieldState }) => (
            <MechanismChoice
              name="injury-mechanism"
              legend="Mecanismo"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="severity"
            render={({ field, fieldState }) => (
              <FormField id="injury-severity" label="Severidad" error={fieldState.error?.message}>
                {(controlProps) => (
                  <SelectInput
                    {...controlProps}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={controller.severityOptions}
                    placeholder="Elige la severidad"
                  />
                )}
              </FormField>
            )}
          />
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <FormField
                id="injury-status"
                label="Estado"
                error={fieldState.error?.message}
                description="El estado solo cambia cuando tú lo actualizas."
              >
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
        </div>
        <FormField
          id="injury-diagnosis"
          label="Diagnóstico"
          optional
          error={errors.diagnosis?.message}
        >
          {(controlProps) => (
            <Textarea {...controlProps} rows={3} {...form.register('diagnosis')} />
          )}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="injury-recovery-date"
            label="Fecha de recuperación"
            optional
            error={errors.recovery_date?.message}
          >
            {(controlProps) => <DateField {...controlProps} {...form.register('recovery_date')} />}
          </FormField>
          <FormField
            id="injury-time-loss"
            label="Días de baja"
            optional
            description="Déjalo vacío para calcularlo con la fecha de recuperación."
            error={errors.time_loss_days?.message}
          >
            {(controlProps) => (
              <Input {...controlProps} inputMode="numeric" {...form.register('time_loss_days')} />
            )}
          </FormField>
        </div>
      </FieldGroup>
    </FormSheet>
  )
}

export function InjuryFormSheet({ open, injury, onClose }: InjuryFormSheetProps) {
  return open ? <InjuryFormContent injury={injury} onClose={onClose} /> : null
}
