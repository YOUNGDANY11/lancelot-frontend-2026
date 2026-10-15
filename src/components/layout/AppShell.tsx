import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { DataPolicyGate } from '@/components/layout/DataPolicyGate'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppContextProvider } from '@/context/AppContextProvider'

export function AppShell() {
  return (
    <AppContextProvider>
      <TooltipProvider delayDuration={300}>
        <div className="flex min-h-dvh bg-background print:block print:bg-white">
          <a
            href="#contenido-app"
            className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Saltar al contenido
          </a>
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main
              id="contenido-app"
              className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 sm:pt-8 lg:pb-10 print:max-w-none print:p-0"
            >
              <Suspense fallback={<LoadingScreen />}>
                <Outlet />
              </Suspense>
            </main>
          </div>
          <MobileNav />
          <DataPolicyGate />
        </div>
      </TooltipProvider>
    </AppContextProvider>
  )
}
