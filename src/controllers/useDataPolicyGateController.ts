import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DATA_POLICY_CONSENT } from '@/constants/dataPolicy'
import { useAuth } from '@/hooks/useAuth'
import { usersService } from '@/services/usersService'
import { parseApiError } from '@/utils/parseApiError'

export function useDataPolicyGateController() {
  const { user, updateUser, logout } = useAuth()

  const accept = useMutation({
    mutationFn: usersService.acceptDataPolicy,
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success(DATA_POLICY_CONSENT.accepted)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  return {
    isPending: user?.data_policy_pending === true,
    accept: () => accept.mutate(),
    isAccepting: accept.isPending,
    signOut: () => void logout(),
  }
}
