import type { RouteObject } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { APP_MODULES, type ModuleKey } from '@/constants/navigation'
import {
  AnalyticsView,
  AppShell,
  AthleteDirectoryView,
  AthleteProfileView,
  ClubView,
  ForbiddenView,
  HealthView,
  HomeView,
  LandingView,
  NotFoundView,
  ProfileView,
  SettingsView,
  TalentView,
  TrainingView,
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
              moduleRoute('club', [{ index: true, element: <ClubView /> }]),
              moduleRoute('athletes', [
                { index: true, element: <AthleteDirectoryView /> },
                { path: ':id_user', element: <AthleteProfileView /> },
              ]),
              moduleRoute('training', [{ index: true, element: <TrainingView /> }]),
              moduleRoute('health', [{ index: true, element: <HealthView /> }]),
              moduleRoute('talent', [{ index: true, element: <TalentView /> }]),
              moduleRoute('analytics', [{ index: true, element: <AnalyticsView /> }]),
              moduleRoute('settings', [{ index: true, element: <SettingsView /> }]),
            ],
          },
        ],
      },
      { path: '403', element: <ForbiddenView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]
