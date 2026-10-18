import { Save, TriangleAlert } from 'lucide-react'
import { ErrorState } from '@/components/common/ErrorState'
import { FormAlert } from '@/components/common/FormAlert'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CALIBRATION_WARNING } from '@/constants/ml'
import {
  useEngineDraft,
  useEngineTabController,
} from '@/controllers/analytics/useEngineTabController'
import { cn } from '@/lib/utils'
import type { EngineConfig, UpdateEngineConfigRequest } from '@/types/ml'

type EngineModeOption = { value: EngineConfig['engine']; label: string; description: string }

function ModeOptions({
  name,
  modes,
  value,
  onChange,
}: {
  name: string
  modes: EngineModeOption[]
  value: EngineConfig['engine']
  onChange: (value: EngineConfig['engine']) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {modes.map((mode) => {
        const checked = value === mode.value
        return (
          <label
            key={mode.value}
            className={cn(
              'flex cursor-pointer flex-col gap-1.5 rounded-xl border border-border p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
              checked && 'border-primary bg-primary/10',
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              <input
                type="radio"
                name={name}
                value={mode.value}
                checked={checked}
                onChange={() => onChange(mode.value)}
                className="accent-primary"
              />
              {mode.label}
            </span>
            <span className="text-sm text-pretty text-muted-foreground">{mode.description}</span>
          </label>
        )
      })}
    </div>
  )
}

interface EngineFormProps {
  config: EngineConfig
  isReady: boolean
  isTalentReady: boolean
  modes: EngineModeOption[]
  talentModes: EngineModeOption[]
  isSaving: boolean
  serverError?: string
  onSave: (payload: UpdateEngineConfigRequest) => void
}

function EngineForm({
  config,
  isReady,
  isTalentReady,
  modes,
  talentModes,
  isSaving,
  serverError,
  onSave,
}: EngineFormProps) {
  const draft = useEngineDraft(config, onSave)

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        draft.submit()
      }}
    >
      <FormAlert message={serverError} />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 flex items-center gap-1 text-sm font-semibold">
          Modo del motor de riesgo
          <HelpHint term="shadowMode" />
        </legend>
        <ModeOptions name="engine-mode" modes={modes} value={draft.mode} onChange={draft.setMode} />
        <p className="text-xs text-muted-foreground">
          El modo sombra necesita un modelo activo. El modo de aprendizaje automático además exige
          la readiness{isReady ? ', que ya se cumple.' : ', que aún no se cumple.'}
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Umbrales de probabilidad del modelo</legend>
        <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          {CALIBRATION_WARNING}
        </p>
        <div className="flex flex-wrap gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="engine-medium">Riesgo medio desde</Label>
            <Input
              id="engine-medium"
              inputMode="decimal"
              value={draft.medium}
              onChange={(event) => draft.setMedium(event.target.value)}
              aria-invalid={Boolean(draft.thresholdError)}
              className="w-32 tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="engine-high">Riesgo alto desde</Label>
            <Input
              id="engine-high"
              inputMode="decimal"
              value={draft.high}
              onChange={(event) => draft.setHigh(event.target.value)}
              aria-invalid={Boolean(draft.thresholdError)}
              className="w-32 tabular-nums"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Probabilidad de 0 a 1 que estima el modelo de que haya una lesión sin contacto en los
          próximos 7 días.
        </p>
        {draft.thresholdError && (
          <p role="alert" className="text-sm text-destructive">
            {draft.thresholdError}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 flex items-center gap-1 text-sm font-semibold">
          Modo del motor de talento
          <HelpHint term="talentDetection" />
        </legend>
        <ModeOptions
          name="talent-engine-mode"
          modes={talentModes}
          value={draft.talentMode}
          onChange={draft.setTalentMode}
        />
        <p className="text-xs text-muted-foreground">
          El modelo de talento corre cada vez que se detecta talento: al cerrar la temporada o con
          «Detectar talento». El modo sombra necesita un modelo de talento activo; el de aprendizaje
          automático además exige su readiness
          {isTalentReady ? ', que ya se cumple.' : ', que aún no se cumple.'}
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="engine-talent-threshold">Sugerir señalización desde</Label>
          <Input
            id="engine-talent-threshold"
            inputMode="decimal"
            value={draft.talentThreshold}
            onChange={(event) => draft.setTalentThreshold(event.target.value)}
            aria-invalid={Boolean(draft.talentThresholdError)}
            className="w-32 tabular-nums"
          />
          <p className="text-xs text-muted-foreground">
            Probabilidad de 0 a 1 de que el deportista juegue en una categoría superior a la de su
            edad la temporada siguiente. {CALIBRATION_WARNING}
          </p>
        </div>
        {draft.talentThresholdError && (
          <p role="alert" className="text-sm text-destructive">
            {draft.talentThresholdError}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={draft.discard}
          disabled={!draft.isDirty || isSaving}
        >
          Descartar cambios
        </Button>
        <Button type="submit" disabled={!draft.isDirty || isSaving}>
          <Save aria-hidden="true" />
          {isSaving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

export function EngineTab() {
  const controller = useEngineTabController()

  if (controller.isLoading)
    return <LoadingSkeleton rows={3} label="Cargando la configuración del motor" />
  if (controller.errorMessage || !controller.config)
    return (
      <ErrorState
        message={controller.errorMessage ?? 'No pudimos cargar el motor.'}
        onRetry={controller.retry}
      />
    )

  return (
    <EngineForm
      key={controller.formKey}
      config={controller.config}
      isReady={controller.isReady}
      isTalentReady={controller.isTalentReady}
      modes={controller.modes}
      talentModes={controller.talentModes}
      isSaving={controller.isSaving}
      serverError={controller.serverError}
      onSave={controller.save}
    />
  )
}
