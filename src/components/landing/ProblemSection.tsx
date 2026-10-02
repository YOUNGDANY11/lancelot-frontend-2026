import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_SECTION_IDS, PROBLEM_CARDS } from '@/constants/landing'

export function ProblemSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.problem}
      eyebrow="El problema"
      title="El seguimiento del deportista se queda en papel"
      description="Las escuelas de formación y los clubes profesionales-amateur no tienen cómo conservar ni analizar la historia de sus jugadores."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {PROBLEM_CARDS.map((card, index) => (
          <Reveal
            as="li"
            key={card.title}
            delay={index * 0.05}
            className="flex flex-col rounded-2xl glass p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-risk-high/10 text-risk-high">
              <card.icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{card.description}</p>
            {card.source && (
              <p className="mt-auto pt-4 text-xs text-muted-foreground italic">{card.source}</p>
            )}
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  )
}
