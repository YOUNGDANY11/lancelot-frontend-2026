import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { JOURNEY_STEPS, LANDING_SECTION_IDS } from '@/constants/landing'

export function HowItWorksSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.howItWorks}
      eyebrow="Cómo funciona"
      title="Un ciclo completo, temporada tras temporada"
      description="Lancelot acompaña al deportista antes, durante y después de cada temporada, y convierte esos registros en información para decidir."
    >
      <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <span
          aria-hidden="true"
          className="absolute top-11 right-[12%] left-[12%] hidden h-px bg-linear-to-r from-primary via-secondary to-accent lg:block"
        />
        {JOURNEY_STEPS.map((step, index) => (
          <Reveal
            as="li"
            key={step.title}
            delay={index * 0.06}
            className="relative flex flex-col rounded-2xl glass p-6"
          >
            <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <step.icon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {step.stage}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{step.description}</p>
          </Reveal>
        ))}
      </ol>
    </LandingSection>
  )
}
