import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { Topbar } from '@/components/layout/Topbar'

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#contenido-app"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <Topbar />
      <main id="contenido-app" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
