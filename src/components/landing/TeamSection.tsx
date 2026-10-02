import { LandingSection } from '@/components/landing/LandingSection'
import { Reveal } from '@/components/landing/Reveal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LANDING_SECTION_IDS, TEAM_CONTENT, TEAM_MEMBERS } from '@/constants/landing'
import { findTeamPhoto } from '@/utils/teamPhotos'

export function TeamSection() {
  return (
    <LandingSection
      id={LANDING_SECTION_IDS.team}
      eyebrow={TEAM_CONTENT.eyebrow}
      title={TEAM_CONTENT.title}
      description={TEAM_CONTENT.description}
    >
      <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {TEAM_MEMBERS.map((member, index) => {
          const photoUrl = findTeamPhoto(member.photoFile)
          return (
            <Reveal
              as="li"
              key={member.name}
              delay={index * 0.06}
              className="flex flex-col items-center rounded-3xl glass p-8 text-center"
            >
              <Avatar className="size-28 ring-2 ring-primary/40 ring-offset-4 ring-offset-transparent">
                {photoUrl && <AvatarImage src={photoUrl} alt={`Fotografía de ${member.name}`} />}
                <AvatarFallback className="bg-linear-to-br from-primary to-secondary font-heading text-3xl font-semibold text-primary-foreground">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-5 text-lg font-semibold">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
            </Reveal>
          )
        })}
      </ul>
    </LandingSection>
  )
}
