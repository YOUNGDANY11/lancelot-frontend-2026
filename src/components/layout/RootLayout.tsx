import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { AuthModalHost } from '@/components/auth/AuthModalHost'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { Toaster } from '@/components/ui/sonner'
import { AuthModalProvider } from '@/context/AuthModalProvider'
import { AuthProvider } from '@/context/AuthProvider'

export function RootLayout() {
  return (
    <AuthModalProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
        <AuthModalHost />
        <Toaster />
      </AuthProvider>
    </AuthModalProvider>
  )
}
