import { Controller } from 'react-hook-form'
import { AthletePicker } from '@/components/common/AthletePicker'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useParentalConsentFormController } from '@/controllers/forms/useParentalConsentFormController'
import type { ParentalConsent } from '@/types/club'
import { todayApiDate } from '@/utils/formatDate'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consent?: ParentalConsent | null
  initialAthleteId?: number
}

function ParentalConsentContent({
  onOpenChange,
  consent,
  initialAthleteId,
}: Omit<SheetProps, 'open'>) {
  const controller = useParentalConsentFormController({
    consent,
    initialAthleteId,
    onDone: () => onOpenChange(false),
  })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title={controller.isEditing ? 'Editar consentimiento' : 'Registrar consentimiento'}
      description={
        controller.isEditing
          ? controller.athleteName
          : 'Autorización del acudiente para tratar los datos de un deportista menor de edad (Ley 1581 de 2012).'
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
              <FormField
                id="consent-athlete"
                label="Deportista menor de edad"
                description="Solo aparecen menores que aún no tienen consentimiento otorgado."
                error={fieldState.error?.message}
              >
                {(controlProps) => (
                  <AthletePicker
                    {...controlProps}
                    options={controller.minorOptions}
                    value={field.value || null}
                    onChange={(id) => field.onChange(id ?? 0)}
                    isLoading={controller.isLoadingAthletes}
                    emptyMessage="No hay menores pendientes de consentimiento con ese nombre."
                  />
                )}
              </FormField>
            )}
          />
        )}
        <FormField
          id="consent-guardian-name"
          label="Nombre del acudiente"
          error={errors.guardian_name?.message}
        >
          {(controlProps) => <Input {...controlProps} {...form.register('guardian_name')} />}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="consent-guardian-document"
            label="Documento del acudiente"
            error={errors.guardian_document?.message}
          >
            {(controlProps) => <Input {...controlProps} {...form.register('guardian_document')} />}
          </FormField>
          <Controller
            control={form.control}
            name="guardian_relationship"
            render={({ field, fieldState }) => (
              <FormField
                id="consent-relationship"
                label="Parentesco"
                error={fieldState.error?.message}
              >
                {(controlProps) => (
                  <SelectInput
                    {...controlProps}
                    value={field.value}
                    onValueChange={field.onChange}
                    options={controller.relationshipOptions}
                    placeholder="Elige el parentesco"
                  />
                )}
              </FormField>
            )}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="consent-signed-at"
            label="Fecha de firma"
            error={errors.signed_at?.message}
          >
            {(controlProps) => (
              <DateField {...controlProps} max={todayApiDate()} {...form.register('signed_at')} />
            )}
          </FormField>
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <FormField id="consent-status" label="Estado" error={fieldState.error?.message}>
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
          id="consent-document-url"
          label="Enlace al documento firmado"
          optional
          description="Por ejemplo, la carpeta del club donde guardan el formato escaneado."
          error={errors.document_url?.message}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              type="url"
              inputMode="url"
              {...form.register('document_url')}
            />
          )}
        </FormField>
      </FieldGroup>
    </FormSheet>
  )
}

export function ParentalConsentFormSheet({ open, ...props }: SheetProps) {
  return open ? <ParentalConsentContent {...props} /> : null
}
