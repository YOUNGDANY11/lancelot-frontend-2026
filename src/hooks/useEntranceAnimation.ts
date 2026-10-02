import { useReducedMotion } from 'motion/react'

export function useEntranceAnimation(delay = 0) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return { initial: false } as const

  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: 'easeOut', delay },
  } as const
}
