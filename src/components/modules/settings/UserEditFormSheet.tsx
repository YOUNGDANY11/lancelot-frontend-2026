import { TriangleAlert } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { DateField } from '@/components/common/DateField'
import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormSheet } from '@/components/common/FormSheet'
import { PasswordInput } from '@/components/common/PasswordInput'
import { SelectInput } from '@/components/common/SelectInput'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useUserEditFormController } from '@/controllers/forms/useUserEditFormController'
import type { User } from '@/types/user'
import { todayApiDate } from '@/utils/formatDate'

interface UserEditFormSheetProps {
  account: User | null
  onClose: () => void
}

function UserEditContent({ account, onClose }: { account: User; onClose: () => void }) {
  const controller = useUserEditFormController({ account, onDone: onClose })
  const { form } = controller
  const { errors } = form.formState

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Editar cuenta de ${controller.accountName}`}
      description="Deja la contraseña vacía para no cambiarla."
      isSubmitting={controller.isSubmitting}
      onSubmit={controller.onSubmit}
    >
      <FieldGroup>
        <FormAlert message={controller.serverError} />
        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <FormField
              id="edit-account-role"
              label="Rol"
              description={controller.isSelf ? 'No puedes cambiar tu propio rol.' : undefined}
              error={fieldState.error?.message}
            >
              {(controlProps) => (
                <SelectInput
                  {...controlProps}
                  value={field.value}
                  onValueChange={field.onChange}
                  options={controller.roleOptions}
                  disabled={controller.isLoadingRoles || controller.isSelf}
                />
              )}
            </FormField>
          )}
        />
        {controller.roleChanged && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
            Al cambiar el rol cambian los módulos y los datos a los que esta persona tiene acceso.
          </p>
        )}
        <FormField id="edit-account-name" label="Nombres" error={errors.name?.message}>
          {(controlProps) => (
            <Input {...controlProps} autoComplete="off" {...form.register('name')} />
          )}
        </FormField>
        <FormField id="edit-account-lastname" label="Apellidos" error={errors.lastname?.message}>
          {(controlProps) => (
            <Input {...controlProps} autoComplete="off" {...form.register('lastname')} />
          )}
        </FormField>
        <FormField id="edit-account-email" label="Correo" error={errors.email?.message}>
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
          id="edit-account-birth-date"
          label="Fecha de nacimiento"
          optional={!controller.birthDateRequired}
          description={controller.birthDateRequired ? 'Obligatoria para deportistas.' : undefined}
          error={errors.birth_date?.message}
        >
          {(controlProps) => (
            <DateField {...controlProps} max={todayApiDate()} {...form.register('birth_date')} />
          )}
        </FormField>
        <FormField
          id="edit-account-password"
          label="Nueva contraseña"
          optional
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
      </FieldGroup>
    </FormSheet>
  )
}

export function UserEditFormSheet({ account, onClose }: UserEditFormSheetProps) {
  return account ? <UserEditContent account={account} onClose={onClose} /> : null
}
