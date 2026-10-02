import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { IntelligenceSection } from '@/components/landing/IntelligenceSection'
import { LandingBackground } from '@/components/landing/LandingBackground'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { ModulesSection } from '@/components/landing/ModulesSection'
import { PartnerSection } from '@/components/landing/PartnerSection'
import { PrivacySection } from '@/components/landing/PrivacySection'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { RolesSection } from '@/components/landing/RolesSection'
import { TeamSection } from '@/components/landing/TeamSection'
import { useLoginRedirectPrompt } from '@/controllers/useLoginRedirectPrompt'

export default function LandingView() {
  useLoginRedirectPrompt()

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <LandingBackground />
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <LandingNavbar />
      <main id="contenido">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <ModulesSection />
        <IntelligenceSection />
        <RolesSection />
        <PrivacySection />
        <PartnerSection />
        <TeamSection />
      </main>
      <LandingFooter />
    </div>
  )
}
