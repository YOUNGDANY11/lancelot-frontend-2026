import { ArrowRight } from 'lucide-react'
import { m } from 'motion/react'
import { Link } from 'react-router'
import { HeroIllustration } from '@/components/landing/HeroIllustration'
import { Button } from '@/components/ui/button'
import { AUTH_ACTION_LABELS, HERO_CONTENT, LANDING_SECTION_IDS } from '@/constants/landing'
import { useLandingAuthController } from '@/controllers/useLandingAuthController'
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation'

export function HeroSection() {
  const { isAuthenticated, dashboardPath, openRegister } = useLandingAuthController()
  const entranceAnimation = useEntranceAnimation()

  return (
    <section
      id={LANDING_SECTION_IDS.hero}
      aria-labelledby="hero-titulo"
      className="scroll-mt-24 px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24 lg:px-8"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        <m.div className="rounded-3xl glass p-6 sm:p-10" {...entranceAnimation}>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {HERO_CONTENT.eyebrow}
          </p>
          <h1
            id="hero-titulo"
            className="mt-5 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-[3.4rem]"
          >
            {HERO_CONTENT.title}
          </h1>
          <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            {HERO_CONTENT.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Button size="lg" className="glow-primary" asChild>
                <Link to={dashboardPath}>
                  {AUTH_ACTION_LABELS.dashboard}
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="glow-primary" onClick={openRegister}>
                {AUTH_ACTION_LABELS.register}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <a href={`#${LANDING_SECTION_IDS.howItWorks}`}>{AUTH_ACTION_LABELS.howItWorks}</a>
            </Button>
          </div>
        </m.div>

        <HeroIllustration />
      </div>
    </section>
  )
}
