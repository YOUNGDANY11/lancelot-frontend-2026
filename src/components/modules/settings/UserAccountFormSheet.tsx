import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { PasswordInput } from '@/components/common/PasswordInput'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { RoleCode } from '@/constants/roles'
import { useUserAccountFormController } from '@/controllers/forms/useUserAccountFormController'
import { todayApiDate } from '@/utils/formatDate'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole?: RoleCode
}

function UserAccountContent({ onOpenChange, defaultRole }: Omit<SheetProps, 'open'>) {
  const controller = useUserAccountFormController({
    onDone: () => onOpenChange(false),
    defaultRole,
  })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={onOpenChange}
      title="Crear cuenta"
      description="La persona podrá cambiar su contraseña desde Mi perfil al ingresar."
      submitLabel="Crear cuenta"
      pendingLabel="Creando…"
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <FormField id="account-role" label="Rol" error={fieldState.error?.message}>
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.roleOptions}
                  disabled={controller.isLoadingRoles}
                />
              )}
            </FormField>
          )}
        />
        <FormField id="account-name" label="Nombres" error={errors.name?.message}>
          {(controlProps) => (
            <Input {...controlProps} autoComplete="off" {...form.register('name')} />
          )}
        </FormField>
        <FormField id="account-lastname" label="Apellidos" error={errors.lastname?.message}>
          {(controlProps) => (
            <Input {...controlProps} autoComplete="off" {...form.register('lastname')} />
          )}
        </FormField>
        <FormField id="account-email" label="Correo" error={errors.email?.message}>
          {(controlProps) => (
            <Input
              {...controlProps}
              type="email"
              inputMode="email"
              autoComplete="off"
              {...form.register('email')}
            />
          )}
        </FormField>
        <FormField
          id="account-password"
          label="Contraseña inicial"
          description="Mínimo 6 caracteres. Compártela de forma privada."
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
          id="account-birth-date"
          label="Fecha de nacimiento"
          optional={!controller.birthDateRequired}
          description={controller.birthDateRequired ? 'Obligatoria para deportistas.' : undefined}
          error={errors.birth_date?.message}
        >
          {(controlProps) => (
            <DateField {...controlProps} max={todayApiDate()} {...form.register('birth_date')} />
          )}
        </FormField>
      </FieldGroup>
    </FormSheet>
  )
}

export function UserAccountFormSheet({ open, onOpenChange, defaultRole }: SheetProps) {
  return open ? <UserAccountContent onOpenChange={onOpenChange} defaultRole={defaultRole} /> : null
}
