import { CircleAlert, CircleCheck, Loader2, UserX } from 'lucide-react'
import { RpeScalePicker } from '@/components/common/RpeScalePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { describeSessionLoad } from '@/constants/rpeScale'
import type { RowSaveState } from '@/controllers/training/useRpeLogController'
import { cn } from '@/lib/utils'
import type { RpeRow } from '@/utils/rpeBatch'

interface RpeRowItemProps {
  row: RpeRow
  saveState?: RowSaveState
  minutes: number | null
  disabled: boolean
  onRpe: (rpe: number) => void
  onMinutes: (minutes: string) => void
  onToggleAbsent: () => void
}

function SaveStateIcon({ saveState }: { saveState?: RowSaveState }) {
  if (!saveState) return null
  if (saveState.state === 'saving') {
    return <Loader2 aria-label="Guardando" className="size-4 animate-spin text-muted-foreground" />
  }
  if (saveState.state === 'saved') {
    return <CircleCheck aria-label="Guardado" className="size-4 text-risk-low" />
  }
  return <CircleAlert aria-label="Error al guardar" className="size-4 text-risk-high" />
}

export function RpeRowItem({
  row,
  saveState,
  minutes,
  disabled,
  onRpe,
  onMinutes,
  onToggleAbsent,
}: RpeRowItemProps) {
  const minutesId = `rpe-minutos-${row.id_user}`

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border p-3 sm:p-4',
        row.absent && 'opacity-60',
        saveState?.state === 'error' && 'border-risk-high/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <SaveStateIcon saveState={saveState} />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.name}</p>
            {row.position && (
              <p className="truncate text-xs text-muted-foreground">{row.position}</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant={row.absent ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleAbsent}
          aria-pressed={row.absent}
          disabled={disabled || row.loadId !== null}
          title={row.loadId !== null ? 'Ya tiene RPE registrado en esta sesión' : undefined}
        >
          <UserX aria-hidden="true" />
          No asistió
        </Button>
      </div>

      {!row.absent && (
        <>
          <RpeScalePicker
            value={row.rpe}
            onChange={onRpe}
            label={`RPE de ${row.name}`}
            disabled={disabled}
          />
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor={minutesId} className="text-sm text-muted-foreground">
              Minutos
            </label>
            <Input
              id={minutesId}
              inputMode="numeric"
              value={row.minutes}
              onChange={(event) => onMinutes(event.target.value)}
              disabled={disabled}
              aria-invalid={minutes === null}
              className="h-9 w-20"
            />
            <span className="text-sm font-medium tabular-nums">
              {describeSessionLoad(row.rpe, minutes)}
            </span>
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
