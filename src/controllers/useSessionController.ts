import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { SESSION_MESSAGES } from '@/constants/messages'
import { ROLE_LABELS } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { fullName, initialsOf } from '@/utils/text'

export function useSessionController() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      navigate(APP_ROUTES.landing, { replace: true })
      toast.success(SESSION_MESSAGES.loggedOut)
    },
  })

  return {
    user,
    fullName: user ? fullName(user) : '',
    initials: user ? initialsOf(user) : '',
    roleLabel: role ? ROLE_LABELS[role] : '',
    logout: () => mutation.mutate(),
    isLoggingOut: mutation.isPending,
  }
}
