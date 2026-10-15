import { Link } from 'react-router'
import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { DATA_POLICY } from '@/constants/dataPolicy'
import { LANDING_SECTION_IDS, PRIVACY_CONTENT, PRIVACY_PRINCIPLES } from '@/constants/landing'
import { APP_ROUTES } from '@/constants/routes'

export function PrivacySection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.privacy}
      eyebrow={PRIVACY_CONTENT.eyebrow}
      title={PRIVACY_CONTENT.title}
      description={PRIVACY_CONTENT.description}
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PRIVACY_PRINCIPLES.map((principle, index) => (
          <Reveal
            as="li"
            key={principle.title}
            delay={index * 0.05}
            className="flex flex-col rounded-2xl glass p-6"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <principle.icon aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{principle.title}</h3>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              {principle.description}
            </p>
          </Reveal>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        <Link
          to={APP_ROUTES.dataPolicy}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {DATA_POLICY.title}
        </Link>
      </p>
    </LandingSection>
  )
}
