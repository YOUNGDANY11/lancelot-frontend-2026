import { Link } from 'react-router'
import { BrandLogo } from '@/components/common/BrandLogo'
import { UserMenu } from '@/components/layout/UserMenu'
import { APP_ROUTES } from '@/constants/routes'

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to={APP_ROUTES.home} className="rounded-lg" aria-label="Lancelot, ir a mi inicio">
          <BrandLogo />
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
