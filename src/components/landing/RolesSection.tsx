import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_SECTION_IDS, ROLES_CONTENT } from '@/constants/landing'
import { LANDING_ROLE_ORDER, ROLE_ICONS, ROLE_LABELS, ROLE_SUMMARIES } from '@/constants/roles'

export function RolesSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.roles}
      eyebrow={ROLES_CONTENT.eyebrow}
      title={ROLES_CONTENT.title}
      description={ROLES_CONTENT.description}
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {LANDING_ROLE_ORDER.map((role, index) => {
          const Icon = ROLE_ICONS[role]
          return (
            <Reveal
              as="li"
              key={role}
              delay={index * 0.05}
              className="flex flex-col rounded-2xl glass p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{ROLE_LABELS[role]}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {ROLE_SUMMARIES[role]}
              </p>
            </Reveal>
          )
        })}
      </ul>
    </LandingSection>
  )
}
