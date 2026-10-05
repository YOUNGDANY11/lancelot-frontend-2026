import { NavLink } from 'react-router'
import { BrandLogo } from '@/components/common/BrandLogo'
import { APP_ROUTES } from '@/constants/routes'
import { useNavigationController, type NavigationItem } from '@/controllers/useNavigationController'
import { cn } from '@/lib/utils'

function SidebarLink({ item }: { item: NavigationItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          isActive && 'bg-sidebar-accent text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            aria-hidden="true"
            className={cn('size-5 shrink-0', isActive && 'text-primary')}
          />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { items } = useNavigationController()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-5">
        <NavLink to={APP_ROUTES.home} className="rounded-lg" aria-label="Lancelot, ir a mi inicio">
          <BrandLogo />
        </NavLink>
      </div>
      <nav aria-label="Módulos" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.key}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
