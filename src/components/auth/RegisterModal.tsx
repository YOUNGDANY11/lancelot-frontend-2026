import { Info, ShieldAlert } from 'lucide-react'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { REGISTER_TEXTS } from '@/constants/authTexts'
import { useRegisterController } from '@/controllers/useRegisterController'
import { todayApiDate } from '@/utils/formatDate'

export function RegisterModal() {
  const { form, onSubmit, isSubmitting, serverError, showMinorNotice, goToLogin } =
    useRegisterController()
  const { errors } = form.formState

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{REGISTER_TEXTS.title}</DialogTitle>
        <DialogDescription>{REGISTER_TEXTS.description}</DialogDescription>
      </DialogHeader>

      <p className="flex gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        {REGISTER_TEXTS.staffHint}
      </p>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormAlert message={serverError} />
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="register-name"
              label={REGISTER_TEXTS.nameLabel}
              error={errors.name?.message}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  autoComplete="given-name"
                  autoFocus
                  {...form.register('name')}
                />
              )}
            </FormField>
            <FormField
              id="register-lastname"
              label={REGISTER_TEXTS.lastnameLabel}
              error={errors.lastname?.message}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  autoComplete="family-name"
                  {...form.register('lastname')}
                />
              )}
            </FormField>
          </div>
          <FormField
            id="register-email"
            label={REGISTER_TEXTS.emailLabel}
            error={errors.email?.message}
          >
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
          <FormField
            id="register-birth-date"
            label={REGISTER_TEXTS.birthDateLabel}
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
          {showMinorNotice && (
            <Alert className="border-risk-medium/40 bg-risk-medium/10">
              <ShieldAlert aria-hidden="true" className="text-risk-medium" />
              <AlertTitle>{REGISTER_TEXTS.minorNoticeTitle}</AlertTitle>
              <AlertDescription>{REGISTER_TEXTS.minorNotice}</AlertDescription>
            </Alert>
          )}
          <FormField
            id="register-password"
            label={REGISTER_TEXTS.passwordLabel}
            description={REGISTER_TEXTS.passwordHint}
            error={errors.password?.message}
          >
            {(controlProps) => (
              <PasswordInput
                {...controlProps}
                autoComplete="new-password"
                {...form.register('password')}
              />
            )}
          </FormField>
          <FormField
            id="register-confirm-password"
            label={REGISTER_TEXTS.confirmPasswordLabel}
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
        <SubmitButton pending={isSubmitting} pendingLabel={REGISTER_TEXTS.submitting} size="lg">
          {REGISTER_TEXTS.submit}
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {REGISTER_TEXTS.hasAccount}{' '}
        <Button variant="link" className="h-auto p-0" onClick={goToLogin}>
          {REGISTER_TEXTS.goToLogin}
        </Button>
      </p>
    </>
  )
}
