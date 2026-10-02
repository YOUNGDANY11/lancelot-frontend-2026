import { GraduationCap } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { FOOTER_CONTENT } from '@/constants/landing'

export function LandingFooter() {
  return (
    <footer className="px-4 pt-8 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-2xl glass-subtle p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex flex-col gap-2">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">
            Seguimiento y análisis integral del deportista.
          </p>
        </div>
        <address className="flex items-start gap-3 text-sm text-muted-foreground not-italic sm:text-right">
          <GraduationCap
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary sm:order-last"
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">{FOOTER_CONTENT.university}</span>
            <span>{FOOTER_CONTENT.faculty}</span>
            <span>{FOOTER_CONTENT.program}</span>
            <span>{FOOTER_CONTENT.advisor}</span>
            <span>{FOOTER_CONTENT.year}</span>
          </span>
        </address>
      </div>
    </footer>
  )
}
