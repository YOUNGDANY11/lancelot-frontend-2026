import { DateField } from '@/components/common/DateField'
import { Label } from '@/components/ui/label'
import { todayApiDate } from '@/utils/formatDate'

interface DateRangeFieldsProps {
  idPrefix: string
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  error?: string
}

export function DateRangeFields({
  idPrefix,
  from,
  to,
  onFromChange,
  onToChange,
  error,
}: DateRangeFieldsProps) {
  const errorId = error ? `${idPrefix}-rango-error` : undefined

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">Periodo</legend>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-desde`}>Desde</Label>
          <DateField
            id={`${idPrefix}-desde`}
            value={from}
            max={to || todayApiDate()}
            onChange={(event) => onFromChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className="w-44"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-hasta`}>Hasta</Label>
          <DateField
            id={`${idPrefix}-hasta`}
            value={to}
            min={from || undefined}
            max={todayApiDate()}
            onChange={(event) => onToChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            className="w-44"
          />
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
