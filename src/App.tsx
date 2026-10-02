import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import { AuthModalProvider } from '@/context/AuthModalProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import LandingView from '@/views/landing/LandingView'

export default function App() {
  return (
    <ThemeProvider>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <AuthModalProvider>
            <LandingView />
          </AuthModalProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}
