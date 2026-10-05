import { lazy } from 'react'

export const AdminHome = lazy(() =>
  import('@/components/modules/home/AdminHome').then((module) => ({ default: module.AdminHome })),
)
export const DirectorHome = lazy(() =>
  import('@/components/modules/home/DirectorHome').then((module) => ({
    default: module.DirectorHome,
  })),
)
export const CoachHome = lazy(() =>
  import('@/components/modules/home/CoachHome').then((module) => ({ default: module.CoachHome })),
)
export const HealthHome = lazy(() =>
  import('@/components/modules/home/HealthHome').then((module) => ({
    default: module.HealthHome,
  })),
)
export const AthleteHome = lazy(() =>
  import('@/components/modules/home/AthleteHome').then((module) => ({
    default: module.AthleteHome,
  })),
)
