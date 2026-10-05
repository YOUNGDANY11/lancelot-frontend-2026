import type { ReactElement } from 'react'
import type { RouteObject } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { RootLayout } from '@/components/layout/RootLayout'
import { APP_MODULES, type ModuleKey } from '@/constants/navigation'
import {
  ForbiddenView,
  HomeView,
  LandingView,
  ModulePlaceholderView,
  NotFoundView,
  ProfileView,
} from '@/routes/lazyViews'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'
import { RoleHomeRedirect } from '@/routes/RoleHomeRedirect'
import RouteErrorView from '@/views/errors/RouteErrorView'

function moduleRoute(key: ModuleKey, children: RouteObject[]): RouteObject {
  const module = APP_MODULES[key]
  return {
    path: module.path.replace(/^\/app\//, ''),
    element: <RoleGuard allow={module.roles} />,
    children,
  }
}

function placeholder(key: ModuleKey): ReactElement {
  return <ModulePlaceholderView moduleKey={key} />
}

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
              moduleRoute('club', [{ index: true, element: placeholder('club') }]),
              moduleRoute('athletes', [
                { index: true, element: placeholder('athletes') },
                { path: ':id_user', element: placeholder('athletes') },
              ]),
              moduleRoute('training', [{ index: true, element: placeholder('training') }]),
              moduleRoute('health', [{ index: true, element: placeholder('health') }]),
              moduleRoute('talent', [{ index: true, element: placeholder('talent') }]),
              moduleRoute('analytics', [{ index: true, element: placeholder('analytics') }]),
              moduleRoute('settings', [{ index: true, element: placeholder('settings') }]),
            ],
          },
        ],
      },
      { path: '403', element: <ForbiddenView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]
