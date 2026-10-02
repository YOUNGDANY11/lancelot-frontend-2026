import { CircleAlert, CircleCheck, TriangleAlert, type LucideIcon } from 'lucide-react'

export const RISK_LEVELS = ['bajo', 'medio', 'alto'] as const

export type RiskLevel = (typeof RISK_LEVELS)[number]

export interface RiskLevelPresentation {
  label: string
  icon: LucideIcon
  className: string
}

export const RISK_LEVEL_PRESENTATION: Record<RiskLevel, RiskLevelPresentation> = {
  bajo: {
    label: 'Bajo',
    icon: CircleCheck,
    className: 'border-risk-low/40 bg-risk-low/10 text-risk-low',
  },
  medio: {
    label: 'Medio',
    icon: TriangleAlert,
    className: 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium',
  },
  alto: {
    label: 'Alto',
    icon: CircleAlert,
    className: 'border-risk-high/40 bg-risk-high/10 text-risk-high',
  },
}
