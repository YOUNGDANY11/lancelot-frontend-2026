import { useId } from 'react'
import { RPE_SCALE, rpeHue, rpeLabel } from '@/constants/rpeScale'
import { cn } from '@/lib/utils'

interface RpeScalePickerProps {
  value: number | null
  onChange: (value: number) => void
  label: string
  disabled?: boolean
  compact?: boolean
}

export function RpeScalePicker({
  value,
  onChange,
  label,
  disabled = false,
  compact = false,
}: RpeScalePickerProps) {
  const groupName = useId()

  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className={cn('grid grid-cols-6 gap-1.5 sm:grid-cols-11', compact && 'sm:gap-1')}>
        {RPE_SCALE.map((step) => {
          const isSelected = value === step.value
          const color = `oklch(0.72 0.16 ${rpeHue(step.value)})`
          return (
            <label
              key={step.value}
              title={`${step.value}: ${step.label}`}
              className={cn(
                'relative flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors select-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
                isSelected
                  ? 'border-transparent text-[#0b1220]'
                  : 'border-border bg-muted/40 hover:bg-muted',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              style={
                isSelected ? { backgroundColor: color } : { boxShadow: `inset 0 -3px 0 ${color}` }
              }
            >
              <input
                type="radio"
                name={groupName}
                value={step.value}
                checked={isSelected}
                onChange={() => onChange(step.value)}
                className="sr-only"
                aria-label={`${step.value}: ${step.label}`}
              />
              {step.value}
            </label>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {value === null ? 'Elige qué tan dura fue la sesión' : `${value}: ${rpeLabel(value)}`}
      </p>
    </fieldset>
  )
}
