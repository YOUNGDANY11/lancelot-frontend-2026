import { BookOpen, Scale } from 'lucide-react'
import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import {
  INTELLIGENCE_CONTENT,
  INTELLIGENCE_PILLARS,
  LANDING_SECTION_IDS,
  SCIENTIFIC_REFERENCES,
} from '@/constants/landing'

export function IntelligenceSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.intelligence}
      eyebrow={INTELLIGENCE_CONTENT.eyebrow}
      title={INTELLIGENCE_CONTENT.title}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {INTELLIGENCE_PILLARS.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 0.06} className="rounded-2xl glass p-6 sm:p-8">
            <h3 className="text-xl font-semibold">{pillar.title}</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {pillar.phases.map((phase) => (
                <li key={phase.label} className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-sm font-semibold text-primary">{phase.label}</p>
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">
                    {phase.description}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-4 rounded-2xl border-accent/40 glass p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Scale aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-2xl font-semibold text-balance">
              {INTELLIGENCE_CONTENT.principle}
            </p>
            <p className="mt-2 max-w-3xl text-sm text-pretty text-muted-foreground sm:text-base">
              {INTELLIGENCE_CONTENT.principleDetail}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <h3 className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <BookOpen aria-hidden="true" className="size-4" />
          Respaldado por la literatura científica
        </h3>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCIENTIFIC_REFERENCES.map((reference) => (
            <li key={reference.author} className="rounded-xl glass-subtle p-4">
              <p className="text-sm font-semibold">
                {reference.author} ({reference.year})
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{reference.topic}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </LandingSection>
  )
}
