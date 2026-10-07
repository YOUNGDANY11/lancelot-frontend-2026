import { BrainCircuit, CircleCheck, DatabaseZap, Gauge, Hourglass, Users } from 'lucide-react'
import { ReadinessProgress } from '@/components/charts/ReadinessProgress'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SetupChecklist } from '@/components/common/SetupChecklist'
import { StatusBadge } from '@/components/common/StatusBadge'
import { HomeSection } from '@/components/modules/home/HomeSection'
import { ML_ENGINE_MODE } from '@/constants/enums'
import { ROLE_ICONS } from '@/constants/roles'
import { useAdminHomeController } from '@/controllers/home/useAdminHomeController'
import { formatDate } from '@/utils/formatDate'
import { formatPercent } from '@/utils/formatNumber'
import { countLabel } from '@/utils/text'

function QualityItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  )
}

export function AdminHome() {
  const controller = useAdminHomeController()
  const { users, engine, readiness, quality } = controller

  return (
    <div className="flex flex-col gap-5">
      <SetupChecklist />

      <HomeSection
        id="usuarios"
        title="Usuarios por rol"
        icon={Users}
        description={
          users.isLoading ? undefined : `${countLabel(users.total, 'cuenta', 'cuentas')} en total`
        }
        linkTo={controller.paths.users}
        linkLabel="Gestionar usuarios"
      >
        {users.isLoading ? (
          <LoadingSkeleton variant="cards" rows={5} label="Cargando usuarios" />
        ) : users.errorMessage ? (
          <ErrorState message={users.errorMessage} onRetry={users.retry} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {users.byRole.map((item) => {
              const Icon = ROLE_ICONS[item.code]
              return (
                <li
                  key={item.code}
                  className="flex flex-col gap-1 rounded-xl border border-border p-3"
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4 text-primary" />
                    {item.label}
                  </span>
                  <span className="text-2xl font-semibold tabular-nums">{item.count}</span>
                </li>
              )
            })}
          </ul>
        )}
      </HomeSection>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <HomeSection
          id="motor"
          title="Motor de IA y readiness"
          icon={BrainCircuit}
          linkTo={controller.paths.analytics}
          linkLabel="Ir a Análisis IA"
        >
          {engine.isLoading ? (
            <LoadingSkeleton rows={1} label="Consultando el motor" />
          ) : engine.errorMessage ? (
            <ErrorState message={engine.errorMessage} />
          ) : (
            engine.mode && (
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-2 text-sm">
                  Modo actual:
                  <StatusBadge
                    label={ML_ENGINE_MODE.labels[engine.mode]}
                    tone={ML_ENGINE_MODE.tones[engine.mode]}
                  />
                  {engine.mode === 'shadow' && <HelpHint term="shadowMode" />}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">{engine.description}</p>
              </div>
            )
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-1 text-sm font-semibold">
              <Gauge aria-hidden="true" className="size-4 text-primary" />
              Readiness para el modelo
              <HelpHint term="readiness" />
            </h3>
            {readiness.isLoading ? (
              <LoadingSkeleton rows={3} label="Consultando la readiness" />
            ) : readiness.errorMessage || !readiness.data ? (
              <ErrorState
                message={readiness.errorMessage ?? 'No pudimos consultar la readiness.'}
                onRetry={readiness.retry}
              />
            ) : (
              <>
                <p className="flex items-center gap-2 text-sm">
                  {readiness.data.ready ? (
                    <>
                      <CircleCheck aria-hidden="true" className="size-4 text-risk-low" />
                      Hay datos suficientes para entrenar un modelo.
                    </>
                  ) : (
                    <>
                      <Hourglass aria-hidden="true" className="size-4 text-muted-foreground" />
                      Aún no hay datos suficientes: el sistema sigue con las reglas.
                    </>
                  )}
                </p>
                <ReadinessProgress criteria={readiness.data.criteria} />
              </>
            )}
          </div>
        </HomeSection>

        <HomeSection
          id="calidad"
          title="Calidad de los datos"
          icon={DatabaseZap}
          description={
            quality.data
              ? `Del ${formatDate(quality.data.period.from)} al ${formatDate(quality.data.period.to)}`
              : undefined
          }
          linkTo={`${controller.paths.analytics}?tab=calidad`}
          linkLabel="Ver detalle"
        >
          {quality.isLoading ? (
            <LoadingSkeleton variant="cards" rows={4} label="Calculando la calidad de datos" />
          ) : quality.errorMessage || !quality.data ? (
            <ErrorState
              message={quality.errorMessage ?? 'No pudimos calcular la calidad de datos.'}
              onRetry={quality.retry}
            />
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-3">
                <QualityItem
                  label="Lesiones sin mecanismo"
                  value={String(quality.data.injuries.without_mechanism)}
                  hint={`${formatPercent(quality.data.injuries.without_mechanism_pct)} de ${quality.data.injuries.total}`}
                />
                <QualityItem
                  label="Partidos sin RPE"
                  value={String(quality.data.matches.without_rpe)}
                  hint={`${formatPercent(quality.data.matches.without_rpe_pct)} de ${quality.data.matches.total}`}
                />
                <QualityItem
                  label="Días sin carga (promedio)"
                  value={formatPercent(quality.data.load_days.avg_days_without_load_pct)}
                  hint="Por deportista en el periodo"
                />
                <QualityItem
                  label="Deportistas con datos"
                  value={String(quality.data.snapshots.athletes_with_data)}
                  hint={`${quality.data.snapshots.days_with_snapshot} días con registro`}
                />
              </dl>
              {quality.data.warnings.length > 0 && (
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {quality.data.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </HomeSection>
      </div>
    </div>
  )
}
