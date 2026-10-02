import { ArrowRight } from 'lucide-react'
import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'
import { AUTH_ACTION_LABELS } from '@/constants/landing'
import { useLandingAuthController } from '@/controllers/useLandingAuthController'
import { cn } from '@/lib/utils'

interface LandingAuthActionsProps {
  stacked?: boolean
  closeOnAction?: boolean
}

export function LandingAuthActions({
  stacked = false,
  closeOnAction = false,
}: LandingAuthActionsProps) {
  const { isAuthenticated, dashboardPath, openLogin, openRegister } = useLandingAuthController()
  const wrap = (button: ReactElement) =>
    closeOnAction ? <SheetClose asChild>{button}</SheetClose> : button

  if (isAuthenticated) {
    return wrap(
      <Button asChild className={cn(stacked && 'w-full')}>
        <Link to={dashboardPath}>
          {AUTH_ACTION_LABELS.dashboard}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>,
    )
  }

  return (
    <>
      {wrap(
        <Button variant="outline" className={cn(stacked && 'w-full')} onClick={openLogin}>
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
