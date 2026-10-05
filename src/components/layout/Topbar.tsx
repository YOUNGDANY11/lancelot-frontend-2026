import { Link } from 'react-router'
import { BrandLogo } from '@/components/common/BrandLogo'
import { ContextSwitcher } from '@/components/layout/ContextSwitcher'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import { UserMenu } from '@/components/layout/UserMenu'
import { APP_ROUTES } from '@/constants/routes'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 md:h-20">
        <Link
          to={APP_ROUTES.home}
          className="shrink-0 rounded-lg lg:hidden"
          aria-label="Lancelot, ir a mi inicio"
        >
          <BrandLogo className="[&_span]:text-lg" />
        </Link>
        <div className="flex min-w-0 flex-1 justify-end md:justify-start">
          <ContextSwitcher />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <NotificationsBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
