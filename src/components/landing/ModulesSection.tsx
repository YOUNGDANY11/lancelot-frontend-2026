import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_MODULES, LANDING_SECTION_IDS } from '@/constants/landing'

export function ModulesSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.modules}
      eyebrow="Módulos"
      title="Organizado por módulos, no por botones"
      description="Cada módulo resuelve una parte del trabajo del club, con una acción principal clara y ayuda junto a cada concepto técnico."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_MODULES.map((module, index) => (
          <Reveal
            as="li"
            key={module.title}
            delay={(index % 3) * 0.05}
            className="group flex gap-4 rounded-2xl glass p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <module.icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold">{module.title}</h3>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{module.description}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </LandingSection>
  )
}
