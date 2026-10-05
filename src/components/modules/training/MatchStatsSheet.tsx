import { Info, Loader2, Save, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { MatchStatRowItem } from '@/components/modules/training/MatchStatRowItem'
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
import {
  useMatchStatsData,
  useMatchStatsForm,
} from '@/controllers/training/useMatchStatsController'
import type { Match } from '@/types/competition'
import { formatDate } from '@/utils/formatDate'
import type { MatchStatRow } from '@/utils/matchStatsBatch'

function MatchStatsForm({
  match,
  initialRows,
  usesCallUps,
}: {
  match: Match
  initialRows: MatchStatRow[]
  usesCallUps: boolean
}) {
  const form = useMatchStatsForm(match, initialRows)

  if (form.rows.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={Users}
          title="No hay deportistas para este partido"
          description="Convócalos en Club → Competencias o asígnalos a la plantilla de la categoría."
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        <p className="flex gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          Si registras el RPE del partido, sus minutos jugados suman a la carga del deportista y a
          su ACWR.
        </p>
        <p className="text-sm text-muted-foreground">
          {usesCallUps ? 'Convocados a la competencia' : 'Plantilla de la categoría'} ·{' '}
          {form.playedCount} jugaron
        </p>
        <ul className="flex flex-col gap-3">
          {form.rows.map((row) => (
            <MatchStatRowItem
              key={row.id_user}
              row={row}
              saveState={form.rowStates[row.id_user]}
              disabled={form.isSaving}
              onTogglePlayed={() => form.togglePlayed(row)}
              onChange={(change) => form.updateRow(row.id_user, change)}
            />
          ))}
        </ul>
      </div>
      <SheetFooter className="gap-2 border-t border-border p-4">
        {form.progress && (
          <div className="flex flex-col gap-1" aria-live="polite">
            <span className="text-xs text-muted-foreground">
              Guardando {form.progress.done} de {form.progress.total}…
            </span>
            <Progress
              value={(form.progress.done / form.progress.total) * 100}
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
          Guardar todo{form.dirtyCount > 0 ? ` (${form.dirtyCount})` : ''}
        </Button>
      </SheetFooter>
    </>
  )
}

function MatchStatsContent({ match, onClose }: { match: Match; onClose: () => void }) {
  const data = useMatchStatsData(match)

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border p-4 pr-12 sm:p-5">
          <SheetTitle className="text-lg">Estadísticas del partido</SheetTitle>
          <SheetDescription>
            {match.name_competency ?? 'Competencia'} · {match.name_category ?? 'Categoría'} ·{' '}
            {formatDate(match.date)} · {match.location}
          </SheetDescription>
        </SheetHeader>
        {data.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton rows={5} label="Cargando la convocatoria" />
          </div>
        ) : data.errorMessage || !data.initialRows ? (
          <div className="p-5">
            <ErrorState
              message={data.errorMessage ?? 'No pudimos cargar la convocatoria.'}
              onRetry={data.retry}
            />
          </div>
        ) : (
          <MatchStatsForm
            match={match}
            initialRows={data.initialRows}
            usesCallUps={data.usesCallUps}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

export function MatchStatsSheet({ match, onClose }: { match: Match | null; onClose: () => void }) {
  return match ? <MatchStatsContent key={match.id_match} match={match} onClose={onClose} /> : null
}
