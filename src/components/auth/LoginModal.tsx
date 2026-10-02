import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { SubmitButton } from '@/components/common/SubmitButton'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LOGIN_TEXTS } from '@/constants/authTexts'
import { useLoginController } from '@/controllers/useLoginController'

export function LoginModal() {
  const { form, onSubmit, isSubmitting, serverError, focusPassword, goToRegister } =
    useLoginController()
  const { errors } = form.formState

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">{LOGIN_TEXTS.title}</DialogTitle>
        <DialogDescription>{LOGIN_TEXTS.description}</DialogDescription>
      </DialogHeader>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <FormAlert message={serverError} />
        <FieldGroup>
          <FormField id="login-email" label={LOGIN_TEXTS.emailLabel} error={errors.email?.message}>
            {(controlProps) => (
              <Input
                {...controlProps}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={LOGIN_TEXTS.emailPlaceholder}
                autoFocus={!focusPassword}
                {...form.register('email')}
              />
            )}
          </FormField>
          <FormField
            id="login-password"
            label={LOGIN_TEXTS.passwordLabel}
            error={errors.password?.message}
          >
            {(controlProps) => (
              <PasswordInput
                {...controlProps}
                autoComplete="current-password"
                autoFocus={focusPassword}
                {...form.register('password')}
              />
            )}
          </FormField>
        </FieldGroup>
        <SubmitButton pending={isSubmitting} pendingLabel={LOGIN_TEXTS.submitting} size="lg">
          {LOGIN_TEXTS.submit}
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {LOGIN_TEXTS.noAccount}{' '}
        <Button variant="link" className="h-auto p-0" onClick={goToRegister}>
          {LOGIN_TEXTS.goToRegister}
        </Button>
      </p>
    </>
  )
}
