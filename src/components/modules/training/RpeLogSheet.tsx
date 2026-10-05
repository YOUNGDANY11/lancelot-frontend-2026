import { Loader2, Save, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { RpeRowItem } from '@/components/modules/training/RpeRowItem'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TRAINING_SESSION_TYPE } from '@/constants/enums'
import { useRpeLogData, useRpeLogForm } from '@/controllers/training/useRpeLogController'
import type { TrainingSession } from '@/types/training'
import { formatDate } from '@/utils/formatDate'
import type { RpeRow } from '@/utils/rpeBatch'

function RpeLogForm({ session, initialRows }: { session: TrainingSession; initialRows: RpeRow[] }) {
  const form = useRpeLogForm(session, initialRows)
  const { summary, progress } = form

  if (form.rows.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={Users}
          title="La plantilla de esta categoría está vacía"
          description="Asigna los deportistas en Club → Plantilla para registrar su RPE."
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {summary.withRpe} de {summary.present} con RPE
            {summary.total - summary.present > 0 &&
              ` · ${summary.total - summary.present} no asistieron`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={form.applyPlannedMinutes}
            disabled={form.isSaving}
          >
            Usar {session.planned_duration_min} min en todos
          </Button>
        </div>
        <ul className="flex flex-col gap-3">
          {form.rows.map((row) => (
            <RpeRowItem
              key={row.id_user}
              row={row}
              saveState={form.rowStates[row.id_user]}
              minutes={form.parsedMinutes(row)}
              disabled={form.isSaving}
              onRpe={(rpe) => form.setRpe(row.id_user, rpe)}
              onMinutes={(minutes) => form.setMinutes(row.id_user, minutes)}
              onToggleAbsent={() => form.toggleAbsent(row.id_user)}
            />
          ))}
        </ul>
      </div>
      <SheetFooter className="gap-2 border-t border-border p-4">
        {progress && (
          <div className="flex flex-col gap-1" aria-live="polite">
            <span className="text-xs text-muted-foreground">
              Guardando {progress.done} de {progress.total}…
            </span>
            <Progress
              value={(progress.done / progress.total) * 100}
              aria-label="Avance del guardado"
            />
          </div>
        )}
        <Button size="lg" onClick={() => void form.save()} disabled={form.isSaving}>
          {form.isSaving ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          Guardar todo{summary.dirty > 0 ? ` (${summary.dirty})` : ''}
        </Button>
      </SheetFooter>
    </>
  )
}

function RpeLogContent({ session, onClose }: { session: TrainingSession; onClose: () => void }) {
  const data = useRpeLogData(session)

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-4 pr-12 sm:p-5">
          <SheetTitle className="flex items-center gap-1 text-lg">
            Registrar RPE
            <HelpHint term="rpe" />
          </SheetTitle>
          <SheetDescription>
            {session.category_name ?? 'Categoría'} · {formatDate(session.date)} ·{' '}
            {TRAINING_SESSION_TYPE.labels[session.type]} · {session.planned_duration_min} min
            planificados
          </SheetDescription>
        </SheetHeader>
        {data.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton rows={5} label="Cargando la plantilla" />
          </div>
        ) : data.errorMessage || !data.initialRows ? (
          <div className="p-5">
            <ErrorState
              message={data.errorMessage ?? 'No pudimos cargar la plantilla.'}
              onRetry={data.retry}
            />
          </div>
        ) : (
          <RpeLogForm session={session} initialRows={data.initialRows} />
        )}
      </SheetContent>
    </Sheet>
  )
}

export function RpeLogSheet({
  session,
  onClose,
}: {
  session: TrainingSession | null
  onClose: () => void
}) {
  return session ? (
    <RpeLogContent key={session.id_session} session={session} onClose={onClose} />
  ) : null
}
