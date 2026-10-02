import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { REGISTER_TEXTS } from '@/constants/authTexts'
import { useAuthModal } from '@/hooks/useAuthModal'
import { registerSchema, toRegisterRequest, type RegisterFormValues } from '@/schemas/authSchemas'
import { authService } from '@/services/authService'
import { isMinor } from '@/utils/age'
import { isValidApiDate } from '@/utils/formatDate'
import { getApiErrorStatus, parseApiError } from '@/utils/parseApiError'

const EMPTY_REGISTER_FORM: RegisterFormValues = {
  name: '',
  lastname: '',
  email: '',
  password: '',
  confirmPassword: '',
  birth_date: '',
}

function isEmailConflict(error: unknown, message: string): boolean {
  return getApiErrorStatus(error) === 400 && /correo/i.test(message)
}

export function useRegisterController() {
  const { openLogin } = useAuthModal()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: EMPTY_REGISTER_FORM,
    mode: 'onTouched',
  })

  const birthDate = useWatch({ control: form.control, name: 'birth_date' })
  const showMinorNotice = isValidApiDate(birthDate) && isMinor(birthDate)

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => authService.register(toRegisterRequest(values)),
    onSuccess: (_response, values) => {
      toast.success(REGISTER_TEXTS.success)
      openLogin({ email: values.email })
    },
    onError: (error) => {
      const message = parseApiError(error)
      if (isEmailConflict(error, message)) {
        form.setError('email', { message }, { shouldFocus: true })
        return
      }
      form.setError('root.server', { message })
    },
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
    showMinorNotice,
    goToLogin: () => openLogin(),
  }
}
