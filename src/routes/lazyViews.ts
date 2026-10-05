import { lazy } from 'react'

export const LandingView = lazy(() => import('@/views/landing/LandingView'))
export const HomeView = lazy(() => import('@/views/app/home/HomeView'))
export const ProfileView = lazy(() => import('@/views/app/profile/ProfileView'))
export const ClubView = lazy(() => import('@/views/app/club/ClubView'))
export const AthleteDirectoryView = lazy(() => import('@/views/app/athletes/AthleteDirectoryView'))
export const AthleteProfileView = lazy(() => import('@/views/app/athletes/AthleteProfileView'))
export const TrainingView = lazy(() => import('@/views/app/training/TrainingView'))
export const ModulePlaceholderView = lazy(() => import('@/views/app/ModulePlaceholderView'))
export const ForbiddenView = lazy(() => import('@/views/errors/ForbiddenView'))
export const NotFoundView = lazy(() => import('@/views/errors/NotFoundView'))
