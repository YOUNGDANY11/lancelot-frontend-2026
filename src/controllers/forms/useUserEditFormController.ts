import { useQuery } from '@tanstack/react-query'
import { useWatch } from 'react-hook-form'
import { ROLE_CODES, ROLE_LABELS } from '@/constants/roles'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAuth } from '@/hooks/useAuth'
import { queryKeys } from '@/lib/queryKeys'
import {
  toAdminUpdateUserRequest,
  userEditSchema,
  type UserEditFormValues,
} from '@/schemas/settingsSchemas'
import { rolesService } from '@/services/rolesService'
import { usersService } from '@/services/usersService'
import type { User } from '@/types/user'
import { resolveRoleCode } from '@/utils/role'
import { fullName } from '@/utils/text'

export function useUserEditFormController({
  account,
  onDone,
}: {
  account: User
  onDone: () => void
}) {
  const { user } = useAuth()
  const isSelf = user?.id_user === account.id_user
  const currentRole = resolveRoleCode(account.role_name, account.id_role) ?? 'ENTRENADOR'

  const rolesQuery = useQuery({
    queryKey: ['roles', 'ids-by-code'],
    queryFn: rolesService.idsByCode,
    staleTime: Infinity,
  })

  const controller = useEntityFormController<UserEditFormValues>({
    schema: userEditSchema,
    defaultValues: {
      name: account.name,
      lastname: account.lastname,
      email: account.email,
      password: '',
      role: currentRole,
      birth_date: account.birth_date?.slice(0, 10) ?? '',
    },
    submit: async (values) => {
      const request = toAdminUpdateUserRequest(values, rolesQuery.data ?? {})
      if (!request) throw new Error('Ese rol no está configurado en el sistema.')
      return usersService.updateByAdmin(account.id_user, request)
    },
    invalidate: [queryKeys.users.all],
    successMessage: (values) => `Cuenta de ${fullName(values)} actualizada.`,
    onDone,
    fieldMatchers: [
      { field: 'email', pattern: /correo/i },
      { field: 'birth_date', pattern: /nacimiento/i },
    ],
  })

  const role = useWatch({ control: controller.form.control, name: 'role' })

  return {
    ...controller,
    accountName: fullName(account),
    isSelf,
    roleChanged: role !== currentRole,
    birthDateRequired: role === 'DEPORTISTA',
    isLoadingRoles: rolesQuery.isPending,
    roleOptions: ROLE_CODES.map((code) => ({ value: code, label: ROLE_LABELS[code] })),
  }
}
