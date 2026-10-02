import { LoginModal } from '@/components/auth/LoginModal'
import { RegisterModal } from '@/components/auth/RegisterModal'
import type { AuthModalView } from '@/context/AuthModalContext'

interface AuthDialogContentProps {
  view: AuthModalView
  prefilledEmail?: string
}

export default function AuthDialogContent({ view, prefilledEmail }: AuthDialogContentProps) {
  return view === 'register' ? <RegisterModal /> : <LoginModal key={prefilledEmail ?? 'login'} />
}
