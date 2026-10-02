import type { UseFormReturn } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PROFILE_TEXTS } from '@/constants/authTexts'
import type { ProfileFormValues } from '@/schemas/profileSchemas'
import { todayApiDate } from '@/utils/formatDate'

interface ProfileDetailsFormProps {
  form: UseFormReturn<ProfileFormValues>
  onSubmit: () => void
  isSubmitting: boolean
  serverError?: string
  canSubmit: boolean
  roleLabel: string
}

export function ProfileDetailsForm({
  form,
  onSubmit,
  isSubmitting,
  serverError,
  canSubmit,
  roleLabel,
}: ProfileDetailsFormProps) {
  const { errors } = form.formState

  return (
    <Card className="glass-subtle">
      <CardHeader>
        <CardTitle className="text-lg">{PROFILE_TEXTS.personalTitle}</CardTitle>
        <CardDescription>{PROFILE_TEXTS.personalDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormAlert message={serverError} />
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="profile-name" label="Nombres" error={errors.name?.message}>
                {(controlProps) => (
                  <Input {...controlProps} autoComplete="given-name" {...form.register('name')} />
                )}
              </FormField>
              <FormField id="profile-lastname" label="Apellidos" error={errors.lastname?.message}>
                {(controlProps) => (
                  <Input
                    {...controlProps}
                    autoComplete="family-name"
                    {...form.register('lastname')}
                  />
                )}
              </FormField>
            </div>
            <FormField id="profile-email" label="Correo" error={errors.email?.message}>
              {(controlProps) => (
                <Input
                  {...controlProps}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...form.register('email')}
                />
              )}
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="profile-birth-date"
                label="Fecha de nacimiento"
                description={PROFILE_TEXTS.birthDateHint}
                error={errors.birth_date?.message}
              >
                {(controlProps) => (
                  <DateField
                    {...controlProps}
                    autoComplete="bday"
                    max={todayApiDate()}
                    {...form.register('birth_date')}
                  />
                )}
              </FormField>
              <FormField
                id="profile-role"
                label={PROFILE_TEXTS.roleLabel}
                description="Solo el administrador puede cambiar tu rol."
              >
                {(controlProps) => <Input {...controlProps} value={roleLabel} readOnly disabled />}
              </FormField>
            </div>
          </FieldGroup>
          <div className="flex justify-end">
            <SubmitButton
              pending={isSubmitting}
              pendingLabel={PROFILE_TEXTS.saving}
              disabled={!canSubmit}
              className="w-full sm:w-auto"
            >
              {PROFILE_TEXTS.save}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
