import { Ellipsis } from 'lucide-react'
import { NavLink } from 'react-router'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useNavigationController } from '@/controllers/useNavigationController'
import { cn } from '@/lib/utils'

const ITEM_CLASS =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.7rem] font-medium leading-tight text-muted-foreground transition-colors'

export function MobileNav() {
  const { primaryItems, overflowItems } = useNavigationController()

  return (
    <nav
      aria-label="Módulos"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-2 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <ul className="flex items-stretch gap-1">
        {primaryItems.map((item) => (
          <li key={item.key} className="flex flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) => cn(ITEM_CLASS, isActive && 'text-primary')}
            >
              <item.icon aria-hidden="true" className="size-5" />
              <span className="line-clamp-1 text-center">{item.label}</span>
            </NavLink>
          </li>
        ))}
        {overflowItems.length > 0 && (
          <li className="flex flex-1">
            <Sheet>
              <SheetTrigger className={ITEM_CLASS}>
                <Ellipsis aria-hidden="true" className="size-5" />
                Más
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
              >
                <SheetHeader>
                  <SheetTitle>Más módulos</SheetTitle>
                  <SheetDescription>Elige a dónde quieres ir.</SheetDescription>
                </SheetHeader>
                <ul className="flex flex-col gap-1 px-4 pb-4">
                  {overflowItems.map((item) => (
                    <li key={item.key}>
                      <SheetClose asChild>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            cn(
                              'flex h-12 items-center gap-3 rounded-xl px-3 text-base font-medium hover:bg-muted',
                              isActive && 'bg-muted text-primary',
                            )
                          }
                        >
                          <item.icon aria-hidden="true" className="size-5" />
                          {item.label}
                        </NavLink>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </li>
        )}
      </ul>
    </nav>
  )
}
