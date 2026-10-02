import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ThemeProvider } from '@/context/ThemeProvider'
import { createQueryClient } from '@/lib/queryClient'
import { appRoutes } from '@/routes/appRoutes'

export function renderAppAt(path: string) {
  const queryClient = createQueryClient()
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })

  const view = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="always">
            <RouterProvider router={router} />
          </MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>,
  )

  return { ...view, router, queryClient }
}
