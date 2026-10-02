import type { UseFormReturn } from 'react-hook-form'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { PROFILE_TEXTS } from '@/constants/authTexts'
import type { ChangePasswordFormValues } from '@/schemas/profileSchemas'

interface ChangePasswordFormProps {
  form: UseFormReturn<ChangePasswordFormValues>
  onSubmit: () => void
  isSubmitting: boolean
  serverError?: string
}

export function ChangePasswordForm({
  form,
  onSubmit,
  isSubmitting,
  serverError,
}: ChangePasswordFormProps) {
  const { errors } = form.formState

  return (
    <Card className="glass-subtle">
      <CardHeader>
        <CardTitle className="text-lg">{PROFILE_TEXTS.passwordTitle}</CardTitle>
        <CardDescription>{PROFILE_TEXTS.passwordDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
          <FormAlert message={serverError} />
          <FieldGroup>
            <FormField
              id="password-current"
              label={PROFILE_TEXTS.currentPasswordLabel}
              error={errors.current_password?.message}
            >
              {(controlProps) => (
                <PasswordInput
                  {...controlProps}
                  autoComplete="current-password"
                  {...form.register('current_password')}
                />
              )}
            </FormField>
            <FormField
              id="password-new"
              label={PROFILE_TEXTS.newPasswordLabel}
              description="Mínimo 6 caracteres."
              error={errors.new_password?.message}
            >
              {(controlProps) => (
                <PasswordInput
                  {...controlProps}
                  autoComplete="new-password"
                  {...form.register('new_password')}
                />
              )}
            </FormField>
            <FormField
              id="password-confirm"
              label={PROFILE_TEXTS.confirmPasswordLabel}
              error={errors.confirmPassword?.message}
            >
              {(controlProps) => (
                <PasswordInput
                  {...controlProps}
                  autoComplete="new-password"
                  {...form.register('confirmPassword')}
                />
              )}
            </FormField>
          </FieldGroup>
          <div className="flex justify-end">
            <SubmitButton
              pending={isSubmitting}
              pendingLabel={PROFILE_TEXTS.passwordSaving}
              className="w-full sm:w-auto"
            >
              {PROFILE_TEXTS.passwordSave}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
