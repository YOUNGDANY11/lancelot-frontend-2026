import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { ROLE_LABELS, type RoleCode } from '@/constants/roles'
import { queryKeys } from '@/lib/queryKeys'
import {
  toAdminCreateUserRequest,
  userAccountSchema,
  type UserAccountFormValues,
} from '@/schemas/settingsSchemas'
import { rolesService } from '@/services/rolesService'
import { usersService } from '@/services/usersService'
import { applyServerError, ROOT_SERVER_ERROR, serverErrorOf } from '@/utils/formErrors'
import { fullName } from '@/utils/text'

const STAFF_ROLE_ORDER: RoleCode[] = [
  'ENTRENADOR',
  'DIRECTOR_TECNICO',
  'ENCARGADO_SALUD',
  'ADMIN',
  'DEPORTISTA',
]

function emptyAccount(role: RoleCode): UserAccountFormValues {
  return { name: '', lastname: '', email: '', password: '', role, birth_date: '' }
}

export function useUserAccountFormController({
  onDone,
  defaultRole = 'ENTRENADOR',
}: {
  onDone: () => void
  defaultRole?: RoleCode
}) {
  const queryClient = useQueryClient()
  const form = useForm<UserAccountFormValues>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: emptyAccount(defaultRole),
    mode: 'onTouched',
  })
  const role = useWatch({ control: form.control, name: 'role' })

  const rolesQuery = useQuery({
    queryKey: ['roles', 'ids-by-code'],
    queryFn: rolesService.idsByCode,
    staleTime: Infinity,
  })

  const mutation = useMutation({
    mutationFn: async (values: UserAccountFormValues) => {
      const request = toAdminCreateUserRequest(values, rolesQuery.data ?? {})
      if (!request) throw new Error('missing-role')
      return usersService.createByAdmin(request)
    },
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success(`Cuenta creada para ${fullName(user)}.`)
      form.reset(emptyAccount(defaultRole))
      onDone()
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'missing-role') {
        form.setError(ROOT_SERVER_ERROR, {
          message: 'Ese rol no está configurado en el sistema. Revisa la lista de roles.',
        })
        return
      }
      applyServerError(form, error, [
        { field: 'email', pattern: /correo/i },
        { field: 'birth_date', pattern: /nacimiento/i },
      ])
    },
  })

  return {
    form,
    roleOptions: STAFF_ROLE_ORDER.map((code) => ({ value: code, label: ROLE_LABELS[code] })),
    birthDateRequired: role === 'DEPORTISTA',
    isLoadingRoles: rolesQuery.isPending,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
