import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/button'
import { DATA_POLICY } from '@/constants/dataPolicy'
import { APP_ROUTES } from '@/constants/routes'

export default function DataPolicyView() {
  return (
    <div className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to={APP_ROUTES.landing} aria-label="Ir a la página principal de Lancelot">
            <BrandLogo />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to={APP_ROUTES.landing}>
              <ArrowLeft aria-hidden="true" />
              Volver
            </Link>
          </Button>
        </header>

        <main className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </span>
            <h1 className="text-3xl font-semibold text-balance">{DATA_POLICY.title}</h1>
            <p className="text-sm text-muted-foreground">{DATA_POLICY.version}</p>
            <p className="text-pretty text-muted-foreground">{DATA_POLICY.intro}</p>
          </div>

          {DATA_POLICY.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-pretty text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="text-pretty">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}
