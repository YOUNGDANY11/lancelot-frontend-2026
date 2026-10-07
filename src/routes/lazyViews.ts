import { lazy } from 'react'

export const LandingView = lazy(() => import('@/views/landing/LandingView'))
export const AppShell = lazy(() =>
  import('@/components/layout/AppShell').then((module) => ({ default: module.AppShell })),
)
export const HomeView = lazy(() => import('@/views/app/home/HomeView'))
export const ProfileView = lazy(() => import('@/views/app/profile/ProfileView'))
export const ClubView = lazy(() => import('@/views/app/club/ClubView'))
export const AthleteDirectoryView = lazy(() => import('@/views/app/athletes/AthleteDirectoryView'))
export const AthleteProfileView = lazy(() => import('@/views/app/athletes/AthleteProfileView'))
export const TrainingView = lazy(() => import('@/views/app/training/TrainingView'))
export const HealthView = lazy(() => import('@/views/app/health/HealthView'))
export const TalentView = lazy(() => import('@/views/app/talent/TalentView'))
export const AnalyticsView = lazy(() => import('@/views/app/analytics/AnalyticsView'))
export const SettingsView = lazy(() => import('@/views/app/settings/SettingsView'))
export const ForbiddenView = lazy(() => import('@/views/errors/ForbiddenView'))
export const NotFoundView = lazy(() => import('@/views/errors/NotFoundView'))
