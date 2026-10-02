import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PROFILE_TEXTS } from '@/constants/authTexts'
import { SESSION_MESSAGES } from '@/constants/messages'
import { ROLE_LABELS } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useDisclosure } from '@/hooks/useDisclosure'
import {
  changePasswordSchema,
  profileSchema,
  toChangePasswordRequest,
  toUpdateMyProfileRequest,
  type ChangePasswordFormValues,
  type ProfileFormValues,
} from '@/schemas/profileSchemas'
import { usersService } from '@/services/usersService'
import type { User } from '@/types/user'
import { getApiErrorStatus, parseApiError } from '@/utils/parseApiError'

const EMPTY_PASSWORD_FORM: ChangePasswordFormValues = {
  current_password: '',
  new_password: '',
  confirmPassword: '',
}

export function toProfileFormValues(user: User | null): ProfileFormValues {
  return {
    name: user?.name ?? '',
    lastname: user?.lastname ?? '',
    email: user?.email ?? '',
    birth_date: user?.birth_date?.slice(0, 10) ?? '',
  }
}

function useProfileForm() {
  const { user, updateUser } = useAuth()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: toProfileFormValues(user),
    resetOptions: { keepDirtyValues: true },
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      usersService.updateMe(toUpdateMyProfileRequest(values)),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      form.reset(toProfileFormValues(updatedUser))
      toast.success(PROFILE_TEXTS.saved)
    },
    onError: (error) => {
      const message = parseApiError(error)
      if (getApiErrorStatus(error) === 400 && /correo/i.test(message)) {
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
    canSubmit: form.formState.isDirty,
  }
}

function usePasswordForm() {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_PASSWORD_FORM,
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      usersService.changeMyPassword(toChangePasswordRequest(values)),
    onSuccess: () => {
      form.reset(EMPTY_PASSWORD_FORM)
      toast.success(PROFILE_TEXTS.passwordSaved)
    },
    onError: (error) => {
      const message = parseApiError(error)
      if (getApiErrorStatus(error) === 400) {
        form.setError('current_password', { message }, { shouldFocus: true })
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
  }
}

function useLogoutAllDevices() {
  const { logoutAllDevices } = useAuth()
  const navigate = useNavigate()
  const confirmation = useDisclosure()

  const mutation = useMutation({
    mutationFn: logoutAllDevices,
    onSuccess: () => {
      confirmation.close()
      navigate(APP_ROUTES.landing, { replace: true })
      toast.success(SESSION_MESSAGES.loggedOutEverywhere)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    confirmation,
    confirm: () => mutation.mutate(),
    isPending: mutation.isPending,
  }
}

export function useProfileController() {
  const { user, role } = useAuth()

  return {
    user,
    roleLabel: role ? ROLE_LABELS[role] : '',
    profile: useProfileForm(),
    password: usePasswordForm(),
    logoutAll: useLogoutAllDevices(),
  }
}
