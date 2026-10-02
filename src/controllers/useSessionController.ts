import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { SESSION_MESSAGES } from '@/constants/messages'
import { ROLE_LABELS } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

function initialsOf(name: string | undefined, lastname: string | undefined): string {
  return [name, lastname]
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('')
    .toUpperCase()
}

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
    fullName: user ? `${user.name} ${user.lastname}` : '',
    initials: initialsOf(user?.name, user?.lastname),
    roleLabel: role ? ROLE_LABELS[role] : '',
    logout: () => mutation.mutate(),
    isLoggingOut: mutation.isPending,
  }
}
