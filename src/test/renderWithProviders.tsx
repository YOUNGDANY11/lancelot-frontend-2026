import { render, type RenderOptions } from '@testing-library/react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { ReactElement, ReactNode } from 'react'
import { AuthModalProvider } from '@/context/AuthModalProvider'
import { ThemeProvider } from '@/context/ThemeProvider'

function TestProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="always">
          <AuthModalProvider>{children}</AuthModalProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: TestProviders, ...options })
}
