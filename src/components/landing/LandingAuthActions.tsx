import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'
import { AUTH_ACTION_LABELS } from '@/constants/landing'
import { useAuthModal } from '@/hooks/useAuthModal'
import { cn } from '@/lib/utils'

interface LandingAuthActionsProps {
  stacked?: boolean
  closeOnAction?: boolean
}

export function LandingAuthActions({
  stacked = false,
  closeOnAction = false,
}: LandingAuthActionsProps) {
  const { openLogin, openRegister } = useAuthModal()
  const wrap = (button: ReactElement) =>
    closeOnAction ? <SheetClose asChild>{button}</SheetClose> : button

  return (
    <>
      {wrap(
        <Button variant="outline" className={cn(stacked && 'w-full')} onClick={() => openLogin()}>
          {AUTH_ACTION_LABELS.login}
        </Button>,
      )}
      {wrap(
        <Button className={cn(stacked && 'w-full')} onClick={openRegister}>
          {AUTH_ACTION_LABELS.register}
        </Button>,
      )}
    </>
  )
}
