import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { LOGIN_TEXTS } from '@/constants/authTexts'
import { useAuth } from '@/hooks/useAuth'
import { useAuthModal } from '@/hooks/useAuthModal'
import { getRoleHome, isSafeReturnPath } from '@/routes/roleHome'
import { loginSchema, toLoginRequest, type LoginFormValues } from '@/schemas/authSchemas'
import { parseApiError } from '@/utils/parseApiError'
import { resolveRoleCode } from '@/utils/role'

export function useLoginController() {
  const { login } = useAuth()
  const { prefilledEmail, returnTo, close, openRegister } = useAuthModal()
  const navigate = useNavigate()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: prefilledEmail ?? '', password: '' },
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(toLoginRequest(values)),
    onSuccess: (user) => {
      close()
      toast.success(LOGIN_TEXTS.welcome(user.name))
      const role = resolveRoleCode(user.role_name, user.id_role)
      navigate(isSafeReturnPath(returnTo) ? returnTo : getRoleHome(role), { replace: true })
    },
    onError: (error) => form.setError('root.server', { message: parseApiError(error) }),
  })

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root.server')
    mutation.mutate(values)
  })

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    serverError: form.formState.errors.root?.server?.message,
    focusPassword: Boolean(prefilledEmail),
    goToRegister: openRegister,
  }
}
