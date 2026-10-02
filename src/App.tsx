import { QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'
import { ThemeProvider } from '@/context/ThemeProvider'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes/router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
          </MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
