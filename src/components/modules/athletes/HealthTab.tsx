import { FileCheck, HeartPulse, Stethoscope, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  HEALTH_RECORD_STATUS,
  INJURY_MECHANISM,
  INJURY_SEVERITY,
  INJURY_STATUS,
  PARENTAL_CONSENT_STATUS,
} from '@/constants/enums'
import { useAthleteHealthController } from '@/controllers/athletes/useAthleteHealthController'
import { formatDate } from '@/utils/formatDate'

function HealthSection({
  title,
  icon: Icon,
  children,
}: {
  title: ReactNode
  icon: typeof HeartPulse
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  )
}

export function HealthTab({ idUser, birthDate }: { idUser: number; birthDate: string | null }) {
  const { injuries, records, consents, healthModulePath } = useAthleteHealthController(
    idUser,
    birthDate,
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Información sensible: solo la ven los roles autorizados y cada acceso a los registros de
          salud queda auditado.
        </p>
        <Button asChild variant="outline">
          <Link to={healthModulePath}>Ir al módulo de Salud</Link>
        </Button>
      </div>

      {consents.visible && consents.isMinor && (
        <HealthSection title="Consentimiento del acudiente" icon={FileCheck}>
          {consents.isLoading ? (
            <LoadingSkeleton rows={1} />
          ) : consents.errorMessage ? (
            <ErrorState message={consents.errorMessage} onRetry={consents.retry} />
          ) : consents.latest ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <StatusBadge
                label={PARENTAL_CONSENT_STATUS.labels[consents.latest.status]}
                tone={PARENTAL_CONSENT_STATUS.tones[consents.latest.status]}
              />
              <span>
                {consents.latest.guardian_name} ({consents.latest.guardian_relationship}) · firmado
                el {formatDate(consents.latest.signed_at)}
              </span>
            </div>
          ) : (
            <p className="flex items-start gap-2 text-sm text-risk-high">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Es menor de edad y no tiene consentimiento registrado.
            </p>
          )}
        </HealthSection>
      )}

      {injuries.visible && (
        <HealthSection title="Lesiones" icon={HeartPulse}>
          {injuries.missingMechanism > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-risk-medium"
              />
              <span>
                {injuries.missingMechanism === 1
                  ? '1 lesión no tiene mecanismo registrado.'
                  : `${injuries.missingMechanism} lesiones no tienen mecanismo registrado.`}{' '}
                Complétalo en Salud: solo las lesiones sin contacto alimentan el modelo de riesgo.
              </span>
              <HelpHint term="nonContactInjury" />
            </p>
          )}
          {injuries.isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : injuries.errorMessage ? (
            <ErrorState message={injuries.errorMessage} onRetry={injuries.retry} />
          ) : injuries.items.length === 0 ? (
            <EmptyState icon={HeartPulse} title="Sin lesiones registradas" className="py-6" />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {injuries.items.map((injury) => (
                <li key={injury.id_injury} className="flex flex-col gap-1.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{injury.body_part}</span>
                    <StatusBadge
                      label={INJURY_STATUS.labels[injury.status]}
                      tone={INJURY_STATUS.tones[injury.status]}
                    />
                    <StatusBadge
                      label={INJURY_SEVERITY.labels[injury.severity]}
                      tone={INJURY_SEVERITY.tones[injury.severity]}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(injury.injury_date)}
                    {injury.mechanism
                      ? ` · ${INJURY_MECHANISM.labels[injury.mechanism]}`
                      : ' · Sin mecanismo registrado'}
                    {injury.time_loss_days !== null && injury.time_loss_days !== undefined
                      ? ` · ${injury.time_loss_days} días de baja`
                      : ''}
                  </p>
                  {injury.diagnosis && <p className="text-sm">{injury.diagnosis}</p>}
                </li>
              ))}
            </ul>
          )}
        </HealthSection>
      )}

      {records.visible && (
        <HealthSection title="Registros de salud" icon={Stethoscope}>
          {records.isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : records.errorMessage ? (
            <ErrorState message={records.errorMessage} onRetry={records.retry} />
          ) : records.items.length === 0 ? (
            <EmptyState icon={Stethoscope} title="Sin registros de salud" className="py-6" />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {records.items.map((record) => (
                <li key={record.id_health} className="flex flex-col gap-1 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium capitalize">{record.condition_type}</span>
                    <StatusBadge
                      label={HEALTH_RECORD_STATUS.labels[record.status]}
                      tone={HEALTH_RECORD_STATUS.tones[record.status]}
                    />
                    {record.restriction && <StatusBadge label="Con restricción" tone="warning" />}
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </HealthSection>
      )}
    </div>
  )
}
