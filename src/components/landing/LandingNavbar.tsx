import { Menu } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LandingAuthActions } from '@/components/landing/LandingAuthActions'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LANDING_NAV_LINKS, LANDING_SECTION_IDS } from '@/constants/landing'

export function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl glass px-3 sm:px-5"
      >
        <a
          href={`#${LANDING_SECTION_IDS.hero}`}
          className="rounded-lg"
          aria-label="Lancelot, ir al inicio"
        >
          <BrandLogo />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {LANDING_NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <LandingAuthActions />
          </div>
          <LandingMobileMenu />
        </div>
      </nav>
    </header>
  )
}

function LandingMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] max-w-xs glass">
        <SheetHeader>
          <SheetTitle>
            <BrandLogo />
          </SheetTitle>
          <SheetDescription>Explora cómo funciona Lancelot.</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-1 px-4">
          {LANDING_NAV_LINKS.map((link) => (
            <li key={link.id}>
              <SheetClose asChild>
                <a
                  href={`#${link.id}`}
                  className="flex h-11 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
                >
                  {link.label}
                </a>
              </SheetClose>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 p-4">
          <LandingAuthActions stacked closeOnAction />
        </div>
      </SheetContent>
    </Sheet>
  )
}
