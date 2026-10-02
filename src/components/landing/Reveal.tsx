import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li'
}

const REVEAL_ANIMATION = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
} as const

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const StaticComponent = as
    return <StaticComponent className={className}>{children}</StaticComponent>
  }

  const Component = as === 'li' ? m.li : m.div

  return (
    <Component
      className={className}
      {...REVEAL_ANIMATION}
      transition={{ duration: 0.25, ease: 'easeOut', delay }}
    >
      {children}
    </Component>
  )
}
