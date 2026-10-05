import {
  BellCheck,
  CircleCheck,
  FileWarning,
  HeartPulse,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AlertCard } from '@/components/modules/health/AlertCard'
import { MissingMechanismSheet } from '@/components/modules/health/MissingMechanismSheet'
import { HomeSection } from '@/components/modules/home/HomeSection'
import { Button } from '@/components/ui/button'
import { INJURY_SEVERITY, INJURY_STATUS } from '@/constants/enums'
import { INBOX_COPY } from '@/constants/health'
import { useHealthHomeController } from '@/controllers/home/useHealthHomeController'
import { formatDate } from '@/utils/formatDate'

export function HealthHome() {
  const controller = useHealthHomeController()
  const { inbox, injuries, minors } = controller

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <HomeSection
        id="bandeja"
        title="Alertas más urgentes"
        icon={ShieldAlert}
        description={`${inbox.totalOpen} pendientes · ${INBOX_COPY.decisionNote}`}
        linkTo={controller.paths.inbox}
        linkLabel="Ir a la bandeja"
        className="xl:row-span-2"
      >
        {inbox.isLoading ? (
          <LoadingSkeleton variant="cards" rows={2} label="Cargando alertas" />
        ) : inbox.errorMessage ? (
          <ErrorState message={inbox.errorMessage} onRetry={inbox.retry} />
        ) : inbox.items.length === 0 ? (
          <EmptyState
            icon={BellCheck}
            title={INBOX_COPY.empty}
            description={INBOX_COPY.emptyDescription}
            className="py-6"
          />
        ) : (
          <ul aria-label="Alertas más urgentes" className="flex flex-col gap-3">
            {inbox.items.map((item) => (
              <li key={item.key}>
                <AlertCard
                  item={item}
                  compact
                  athletePath={inbox.athletePath(item)}
                  isPending={inbox.pendingKey === item.key}
                  onDecide={(status) => inbox.decide(item, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      <HomeSection
        id="lesiones"
        title="Lesiones en curso"
        icon={HeartPulse}
        description={injuries.isLoading ? undefined : `${injuries.total} activas o en recuperación`}
        linkTo={controller.paths.injuries}
      >
        {!controller.isLoadingMechanism && controller.missingMechanism > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-risk-medium"
              />
              {controller.missingMechanism === 1
                ? '1 lesión sin mecanismo registrado.'
                : `${controller.missingMechanism} lesiones sin mecanismo registrado.`}
            </p>
            <Button size="sm" variant="outline" onClick={controller.missingSheet.open}>
              Completar mecanismo
            </Button>
          </div>
        )}
        {injuries.isLoading ? (
          <LoadingSkeleton rows={2} label="Cargando lesiones" />
        ) : injuries.errorMessage ? (
          <ErrorState message={injuries.errorMessage} onRetry={injuries.retry} />
        ) : injuries.items.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck aria-hidden="true" className="size-4 text-risk-low" />
            No hay lesiones activas ni en recuperación.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {injuries.items.map((injury) => (
              <li key={injury.id_injury} className="flex flex-col gap-1 py-2.5">
                <Link
                  to={controller.athletePath(injury.id_user)}
                  className="font-medium hover:underline"
                >
                  {injury.athlete_name || 'Deportista'}
                </Link>
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {injury.body_part} · {formatDate(injury.injury_date)}
                  <StatusBadge
                    label={INJURY_STATUS.labels[injury.status]}
                    tone={INJURY_STATUS.tones[injury.status]}
                  />
                  <StatusBadge
                    label={INJURY_SEVERITY.labels[injury.severity]}
                    tone={INJURY_SEVERITY.tones[injury.severity]}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      <HomeSection
        id="consentimientos"
        title="Menores sin consentimiento"
        icon={FileWarning}
        description="Sin consentimiento otorgado no se pueden registrar sus datos de salud."
        linkTo={controller.paths.consents}
        linkLabel="Ir a consentimientos"
      >
        {minors.isLoading ? (
          <LoadingSkeleton rows={2} label="Buscando menores sin consentimiento" />
        ) : minors.errorMessage ? (
          <ErrorState message={minors.errorMessage} />
        ) : minors.total === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheck aria-hidden="true" className="size-4 text-risk-low" />
            Todos los menores tienen el consentimiento del acudiente.
          </p>
        ) : (
          <>
            <p className="text-sm">
              <span className="text-2xl font-semibold tabular-nums">{minors.total}</span>{' '}
              {minors.total === 1 ? 'menor pendiente' : 'menores pendientes'}
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {minors.items.map((minor) => (
                <li key={minor.id_user}>
                  {minor.name}
                  {minor.age !== null && (
                    <span className="text-muted-foreground"> · {minor.age} años</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </HomeSection>

      <MissingMechanismSheet
        open={controller.missingSheet.isOpen}
        onOpenChange={controller.missingSheet.setIsOpen}
      />
    </div>
  )
}
