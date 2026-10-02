import { lazy } from 'react'

export const LandingView = lazy(() => import('@/views/landing/LandingView'))
export const HomeView = lazy(() => import('@/views/app/home/HomeView'))
export const ProfileView = lazy(() => import('@/views/app/profile/ProfileView'))
export const ForbiddenView = lazy(() => import('@/views/errors/ForbiddenView'))
export const NotFoundView = lazy(() => import('@/views/errors/NotFoundView'))
