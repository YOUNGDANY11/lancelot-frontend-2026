import { CircleCheck, Dumbbell, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RpeScalePicker } from '@/components/common/RpeScalePicker'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TRAINING_SESSION_TYPE } from '@/constants/enums'
import { describeSessionLoad } from '@/constants/rpeScale'
import { useMyRpeController } from '@/controllers/training/useMyRpeController'
import { formatDate } from '@/utils/formatDate'
import { parseMinutes } from '@/utils/rpeBatch'

export function MyRpeReport({ limit }: { limit?: number }) {
  const controller = useMyRpeController()

  if (!controller.hasCategory) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Aún no tienes categoría asignada"
        description="Cuando el cuerpo técnico te asigne a una categoría, aquí verás tus sesiones."
      />
    )
  }
  if (controller.isLoading) return <LoadingSkeleton rows={2} label="Cargando tus sesiones" />
  if (controller.errorMessage) {
    return <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
  }

  const sessions = limit ? controller.sessions.slice(0, limit) : controller.sessions
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No tienes sesiones en los últimos 7 días"
        description="Cuando tu entrenador programe una sesión, podrás reportar aquí qué tan dura fue."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {sessions.map((session) => {
        const draft = controller.draftFor(session)
        const minutes = parseMinutes(draft.minutes)
        const isSaving = controller.savingSessionId === session.id_session
        const reported = controller.isReported(session)
        const minutesId = `mi-rpe-minutos-${session.id_session}`
        return (
          <li key={session.id_session} className="flex flex-col gap-3 rounded-2xl glass-subtle p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-medium">
                  {TRAINING_SESSION_TYPE.labels[session.type]} · {formatDate(session.date)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session.planned_duration_min} minutos planificados
                </span>
              </div>
              <div className="flex gap-2">
                {controller.isToday(session) && <StatusBadge label="Hoy" tone="info" />}
                {reported && <StatusBadge label="Reportado" tone="success" className="gap-1" />}
              </div>
            </div>
            <p className="flex items-center gap-1 text-sm font-medium">
              ¿Qué tan dura fue la sesión?
              <HelpHint term="rpe" />
            </p>
            <RpeScalePicker
              value={draft.rpe}
              onChange={(rpe) => controller.setDraft(session, { rpe })}
              label={`Tu RPE de la sesión del ${formatDate(session.date)}`}
              disabled={isSaving}
            />
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor={minutesId} className="text-sm text-muted-foreground">
                Minutos que entrenaste
              </label>
              <Input
                id={minutesId}
                inputMode="numeric"
                value={draft.minutes}
                onChange={(event) => controller.setDraft(session, { minutes: event.target.value })}
                aria-invalid={minutes === null}
                disabled={isSaving}
                className="h-9 w-20"
              />
              <span className="text-sm tabular-nums">
                {describeSessionLoad(draft.rpe, minutes)}
              </span>
            </div>
            <Button
              onClick={() => controller.submit(session)}
              disabled={isSaving || draft.rpe === null || minutes === null}
              className="self-stretch sm:self-end"
              size="lg"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : reported ? (
                <CircleCheck aria-hidden="true" />
              ) : null}
              {reported ? 'Actualizar mi RPE' : 'Guardar mi RPE'}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
