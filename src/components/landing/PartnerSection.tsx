import { Handshake } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { LANDING_SECTION_IDS, PARTNER_CONTENT } from '@/constants/landing'

export function PartnerSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.partner}
      aria-labelledby="socio-titulo"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <Reveal className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 rounded-3xl glass p-8 text-center sm:p-12">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Handshake aria-hidden="true" className="size-7" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {PARTNER_CONTENT.eyebrow}
          </p>
          <h2 id="socio-titulo" className="mt-2 text-4xl font-semibold sm:text-5xl">
            {PARTNER_CONTENT.name}
          </h2>
        </div>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          {PARTNER_CONTENT.description}
        </p>
      </Reveal>
    </section>
  )
}
