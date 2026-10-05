import { HelpHint } from '@/components/common/HelpHint'
import { INJURY_MECHANISM, type InjuryMechanism } from '@/constants/enums'
import { cn } from '@/lib/utils'

const DESCRIPTIONS: Record<InjuryMechanism, string> = {
  contacto: 'Choque o golpe con otra persona u objeto.',
  sin_contacto: 'Sin choque: por ejemplo, un desgarro al acelerar o frenar.',
}

interface MechanismChoiceProps {
  name: string
  legend: string
  value: InjuryMechanism | '' | null | undefined
  onChange: (value: InjuryMechanism) => void
  error?: string
  compact?: boolean
  disabled?: boolean
  hideLegend?: boolean
}

export function MechanismChoice({
  name,
  legend,
  value,
  onChange,
  error,
  compact = false,
  disabled = false,
  hideLegend = false,
}: MechanismChoiceProps) {
  const errorId = error ? `${name}-error` : undefined

  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-invalid={Boolean(error)}
      aria-describedby={errorId}
      disabled={disabled}
    >
      <legend
        className={cn('mb-2 flex items-center gap-1 text-sm font-medium', hideLegend && 'sr-only')}
      >
        {legend}
        {!hideLegend && <HelpHint term="nonContactInjury" />}
      </legend>
      <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
        {INJURY_MECHANISM.options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-start gap-2 rounded-xl border border-border p-3 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
                checked && 'border-primary bg-primary/10',
                compact && 'items-center justify-center p-2 text-center',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className={cn('mt-0.5 accent-primary', compact && 'sr-only')}
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{option.label}</span>
                {!compact && (
                  <span className="text-xs text-muted-foreground">
                    {DESCRIPTIONS[option.value]}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>
      {!compact && (
        <p className="text-xs text-pretty text-muted-foreground">
          Solo las lesiones sin contacto alimentan el modelo de riesgo, porque se relacionan con la
          carga.
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  )
}
