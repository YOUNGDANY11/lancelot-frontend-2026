import { Activity, CalendarDays, ClipboardList, ShieldAlert, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LevelBadge } from '@/components/common/LevelBadge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { StatusBadge } from '@/components/common/StatusBadge'
import { HomeSection } from '@/components/modules/home/HomeSection'
import { RpeLogSheet } from '@/components/modules/training/RpeLogSheet'
import { Button } from '@/components/ui/button'
import { TRAINING_SESSION_TYPE } from '@/constants/enums'
import { INBOX_KIND_LABELS } from '@/constants/health'
import { useCoachHomeController } from '@/controllers/home/useCoachHomeController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'
import { fullName } from '@/utils/text'

export function CoachHome() {
  const controller = useCoachHomeController()
  const { sessions, team } = controller

  if (!controller.hasCategory) {
    return (
      <p className="rounded-2xl glass-subtle p-5 text-sm text-muted-foreground">
        Crea una categoría en Club para ver aquí tus sesiones, la carga y los partidos.
      </p>
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <HomeSection
        id="sesiones"
        title="Sesiones de esta semana"
        icon={CalendarDays}
        description={controller.categoryName}
        linkTo={controller.paths.training}
        linkLabel="Ir a entrenamiento"
      >
        {!controller.hasSeason ? (
          <p className="text-sm text-muted-foreground">
            Activa una temporada para programar sesiones.
          </p>
        ) : sessions.isLoading ? (
          <LoadingSkeleton rows={2} label="Cargando sesiones" />
        ) : sessions.errorMessage ? (
          <ErrorState message={sessions.errorMessage} onRetry={sessions.retry} />
        ) : sessions.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay sesiones programadas esta semana.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {sessions.items.map((session) => (
              <li
                key={session.id_session}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2 font-medium">
                    {formatDate(session.date, "EEEE d 'de' MMMM")}
                    {sessions.isToday(session) && <StatusBadge label="Hoy" tone="info" />}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {TRAINING_SESSION_TYPE.labels[session.type]} · {session.planned_duration_min}{' '}
                    min
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={sessions.isToday(session) ? 'default' : 'outline'}
                  onClick={() => controller.openRpeLog(session)}
                  aria-label={`Registrar RPE de la sesión del ${formatDate(session.date)}`}
                >
                  <ClipboardList aria-hidden="true" />
                  Registrar RPE
                </Button>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      <HomeSection
        id="carga"
        title="ACWR de la plantilla"
        icon={Activity}
        description="Los de mayor riesgo primero."
        linkTo={controller.paths.teamLoad}
        linkLabel="Ver carga del equipo"
      >
        {team.isLoading ? (
          <LoadingSkeleton variant="table" rows={3} label="Calculando el ACWR" />
        ) : team.errorMessage ? (
          <ErrorState message={team.errorMessage} onRetry={team.retry} />
        ) : team.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            La plantilla de esta categoría está vacía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">ACWR de la plantilla</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="pb-2 font-medium">
                  Deportista
                </th>
                <th scope="col" className="pb-2 font-medium">
                  <span className="flex items-center gap-1">
                    ACWR <HelpHint term="acwr" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {team.items.map((athlete) => (
                <tr key={athlete.id_user}>
                  <td className="py-2">
                    <Link
                      to={controller.athletePath(athlete.id_user)}
                      className="font-medium hover:underline"
                    >
                      {fullName(athlete)}
                    </Link>
                  </td>
                  <td className="py-2">
                    {athlete.acwr === null ? (
                      <span className="text-muted-foreground">Sin datos</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums">{formatNumber(athlete.acwr, 2)}</span>
                        {athlete.level && <LevelBadge level={athlete.level} />}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </HomeSection>

      <HomeSection
        id="partido"
        title="Próximo partido"
        icon={Trophy}
        linkTo={controller.paths.matches}
        linkLabel="Ver partidos"
      >
        {controller.isLoadingMatch ? (
          <LoadingSkeleton rows={1} label="Buscando el próximo partido" />
        ) : controller.nextMatch ? (
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold">
              {formatDate(controller.nextMatch.date, "EEEE d 'de' MMMM")} ·{' '}
              {controller.nextMatch.time.slice(0, 5)}
            </p>
            <p className="text-sm text-muted-foreground">
              {[controller.nextMatch.name_competency, controller.nextMatch.location]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay partidos programados.</p>
        )}
      </HomeSection>

      <HomeSection
        id="alertas"
        title="Deportistas con alerta abierta"
        icon={ShieldAlert}
        linkTo={controller.paths.inbox}
        linkLabel="Ir a la bandeja"
      >
        {controller.isLoadingAlerts ? (
          <LoadingSkeleton rows={2} label="Cargando alertas" />
        ) : controller.alerted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nadie de la plantilla tiene alertas pendientes.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {controller.alerted.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <Link
                    to={controller.athletePath(item.id_user)}
                    className="font-medium hover:underline"
                  >
                    {item.athleteName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {INBOX_KIND_LABELS[item.kind]} · {formatDate(item.date)}
                  </span>
                </div>
                <LevelBadge level={item.level} />
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      <RpeLogSheet session={controller.rpeSession} onClose={controller.closeRpeLog} />
    </div>
  )
}
