import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react'
import { RpeScalePicker } from '@/components/common/RpeScalePicker'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RowSaveState } from '@/controllers/training/useRpeLogController'
import { cn } from '@/lib/utils'
import type { MatchCounterField, MatchStatRow } from '@/utils/matchStatsBatch'

const COUNTER_FIELDS: { field: MatchCounterField; label: string }[] = [
  { field: 'goals', label: 'Goles' },
  { field: 'assists', label: 'Asistencias' },
  { field: 'yellow', label: 'Amarillas' },
  { field: 'red', label: 'Rojas' },
]

interface MatchStatRowItemProps {
  row: MatchStatRow
  saveState?: RowSaveState
  disabled: boolean
  onTogglePlayed: () => void
  onChange: (change: Partial<MatchStatRow>) => void
}

export function MatchStatRowItem({
  row,
  saveState,
  disabled,
  onTogglePlayed,
  onChange,
}: MatchStatRowItemProps) {
  const playedId = `jugo-${row.id_user}`

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border p-3 sm:p-4',
        !row.played && 'opacity-70',
        saveState?.state === 'error' && 'border-risk-high/50',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 font-medium">
          {saveState?.state === 'saving' && (
            <Loader2 aria-label="Guardando" className="size-4 animate-spin text-muted-foreground" />
          )}
          {saveState?.state === 'saved' && (
            <CircleCheck aria-label="Guardado" className="size-4 text-risk-low" />
          )}
          {saveState?.state === 'error' && (
            <CircleAlert aria-label="Error al guardar" className="size-4 text-risk-high" />
          )}
          <span className="truncate">{row.name}</span>
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id={playedId}
            checked={row.played}
            onCheckedChange={onTogglePlayed}
            disabled={disabled || row.statId !== null}
          />
          <Label htmlFor={playedId}>Jugó</Label>
        </div>
      </div>

      {row.played && (
        <>
          <div className="grid grid-cols-5 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`minutos-${row.id_user}`} className="text-xs text-muted-foreground">
                Minutos
              </Label>
              <Input
                id={`minutos-${row.id_user}`}
                inputMode="numeric"
                value={row.minutes}
                onChange={(event) => onChange({ minutes: event.target.value })}
                disabled={disabled}
                className="h-9 px-2"
              />
            </div>
            {COUNTER_FIELDS.map(({ field, label }) => (
              <div key={field} className="flex flex-col gap-1">
                <Label
                  htmlFor={`${field}-${row.id_user}`}
                  className="text-xs text-muted-foreground"
                >
                  {label}
                </Label>
                <Input
                  id={`${field}-${row.id_user}`}
                  inputMode="numeric"
                  value={row[field]}
                  onChange={(event) => onChange({ [field]: event.target.value })}
                  disabled={disabled}
                  className="h-9 px-2"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">RPE del partido (opcional)</p>
            <RpeScalePicker
              value={row.rpe}
              onChange={(rpe) => onChange({ rpe })}
              label={`RPE del partido de ${row.name}`}
              disabled={disabled}
            />
          </div>
        </>
      )}

      {saveState?.state === 'error' && (
        <p role="alert" className="text-sm text-risk-high">
          {saveState.message}
        </p>
      )}
    </li>
  )
}
