import { Activity, CalendarCheck, Clock, Goal, ShieldCheck, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { ProgressRadarChart } from '@/components/charts/ProgressRadarChart'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { KpiCard } from '@/components/common/KpiCard'
import { LevelBadge } from '@/components/common/LevelBadge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { SPORT } from '@/constants/enums'
import { useAthleteSummaryController } from '@/controllers/athletes/useAthleteSummaryController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber, formatPercent } from '@/utils/formatNumber'
import { countLabel } from '@/utils/text'

export function AthleteSummaryTab({ idUser }: { idUser: number }) {
  const controller = useAthleteSummaryController(idUser)

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Selecciona una temporada"
        description="El resumen se calcula por temporada."
      />
    )
  }
  if (controller.isLoading) return <LoadingSkeleton variant="cards" rows={4} />
  if (controller.errorMessage || !controller.summary || !controller.view) {
    return (
      <ErrorState
        message={controller.errorMessage ?? 'No pudimos generar el resumen.'}
        onRetry={controller.retry}
      />
    )
  }

  const view = controller.view
  const { training_participation: training, match_participation: matches } = view
  const index = view.weighted_progress_index

  return (
    <div className="flex flex-col gap-5">
      {controller.sportViews.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Juega fútbol y fútbol sala: la participación y el índice se calculan por deporte. Las
            alertas de carga suman ambos.
          </p>
          <div role="group" aria-label="Deporte" className="flex flex-wrap gap-2">
            {controller.sportViews.map((item) => (
              <Button
                key={item.sport}
                type="button"
                size="sm"
                variant={item.sport === view.sport ? 'secondary' : 'ghost'}
                aria-pressed={item.sport === view.sport}
                onClick={() => controller.selectSport(item.sport)}
              >
                {SPORT.labels[item.sport]}
                {item.category ? ` · ${item.category}` : ''}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Asistencia a entrenamientos"
          value={formatPercent(training.attendance_rate)}
          hint={`${training.sessions_attended} de ${countLabel(training.total_sessions, 'sesión', 'sesiones')} con RPE registrado`}
          icon={CalendarCheck}
        />
        <KpiCard
          label="RPE promedio"
          value={formatNumber(training.avg_rpe, 1)}
          hint="Escala de 0 a 10"
          icon={Activity}
          helpTerm="rpe"
        />
        <KpiCard
          label="Partidos jugados"
          value={`${matches.matches_played}`}
          hint={`de ${matches.matches_in_season} de su categoría en la temporada`}
          icon={Trophy}
        />
        <KpiCard
          label="Minutos jugados"
          value={formatNumber(matches.total_minutes, 0)}
          hint={`${matches.goals} goles · ${matches.assists} asistencias`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ProgressRadarChart index={index} />
          {index?.warnings && index.warnings.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-xl border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
              {index.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>

        <section className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Alertas activas</h3>
            {controller.healthInboxPath && controller.openAlerts.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link to={controller.healthInboxPath}>Ir a la bandeja</Link>
              </Button>
            )}
          </header>
          {controller.openAlerts.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Sin alertas pendientes"
              description="No hay alertas de fatiga ni evaluaciones de riesgo por revisar en esta temporada."
              className="py-6"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {controller.openAlerts.map((alert) => (
                <li key={alert.key} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{alert.kind}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(alert.date)}
                      {alert.acwr !== null && ` · ACWR ${formatNumber(alert.acwr, 2)}`}
                    </span>
                  </div>
                  <LevelBadge level={alert.level} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {view.position === null && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Goal aria-hidden="true" className="size-4" />
          Este deportista no tiene posición en {controller.seasonName}: asígnala en Club → Plantilla
          para calcular su índice.
        </p>
      )}
    </div>
  )
}
