import type { RouteObject } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { RootLayout } from '@/components/layout/RootLayout'
import { ForbiddenView, HomeView, LandingView, NotFoundView, ProfileView } from '@/routes/lazyViews'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleHomeRedirect } from '@/routes/RoleHomeRedirect'
import RouteErrorView from '@/views/errors/RouteErrorView'

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorView />,
    children: [
      { index: true, element: <LandingView /> },
      {
        path: 'app',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <RoleHomeRedirect /> },
              { path: 'inicio', element: <HomeView /> },
              { path: 'perfil', element: <ProfileView /> },
            ],
          },
        ],
      },
      { path: '403', element: <ForbiddenView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]
