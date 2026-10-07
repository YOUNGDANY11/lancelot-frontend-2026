import { Info, RotateCcw, Save, TriangleAlert } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ConfigDefinition } from '@/constants/configFields'
import { useConfigDraftController } from '@/controllers/settings/useConfigDraftController'
import { useScopedConfigController } from '@/controllers/settings/useScopedConfigController'
import type { ConfigKind, ConfigValues } from '@/types/config'

interface ConfigFormProps {
  definition: ConfigDefinition
  values: ConfigValues
  forceSave: boolean
  isSaving: boolean
  onSave: (values: ConfigValues) => void
}

function ConfigForm({ definition, values, forceSave, isSaving, onSave }: ConfigFormProps) {
  const form = useConfigDraftController({ definition, values, forceSave, onSave })

  return (
    <form
      noValidate
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        form.submit()
      }}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {definition.fields.map((field) => {
          const id = `${definition.kind}-${field.key}`
          const helpId = `${id}-ayuda`
          const error = form.fieldErrors[field.key]
          const errorId = error ? `${id}-error` : undefined

          if (field.type === 'boolean') {
            return (
              <div
                key={field.key}
                className="flex items-start gap-3 rounded-xl border border-border p-3 md:col-span-2"
              >
                <Checkbox
                  id={id}
                  checked={Boolean(form.draft[field.key])}
                  onCheckedChange={(checked) => form.setField(field.key, checked === true)}
                  aria-describedby={helpId}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <Label htmlFor={id}>{field.label}</Label>
                  <p id={helpId} className="text-xs text-pretty text-muted-foreground">
                    {field.help}
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={id}>{field.label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={id}
                  inputMode={field.type === 'integer' ? 'numeric' : 'decimal'}
                  value={String(form.draft[field.key] ?? '')}
                  onChange={(event) => form.setField(field.key, event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={[helpId, errorId].filter(Boolean).join(' ')}
                  className="max-w-36 tabular-nums"
                />
                {field.suffix && (
                  <span className="text-sm text-muted-foreground">{field.suffix}</span>
                )}
              </div>
              <p id={helpId} className="text-xs text-pretty text-muted-foreground">
                {field.help}
              </p>
              {error && (
                <p id={errorId} className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {form.ruleErrors.length > 0 && (
        <ul
          role="alert"
          className="flex flex-col gap-1 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          {form.ruleErrors.map((message) => (
            <li key={message} className="flex items-start gap-2">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              {message}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={form.discard}
          disabled={!form.isDirty || isSaving}
        >
          Descartar cambios
        </Button>
        <Button type="submit" disabled={!form.canSubmit || isSaving}>
          <Save aria-hidden="true" />
          {isSaving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

export function ScopedConfigTab({ kind }: { kind: ConfigKind }) {
  const controller = useScopedConfigController(kind)
  const { definition, config } = controller

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-pretty text-muted-foreground">{definition.description}</p>

      <div className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:w-72">
          <Label htmlFor={`${kind}-scope`}>Aplicar a</Label>
          <SelectInput
            id={`${kind}-scope`}
            value={controller.scopeValue}
            onValueChange={controller.onScopeChange}
            options={controller.scopeOptions}
          />
        </div>
        {!controller.isLoading && config && (
          <div className="flex flex-wrap items-center gap-2">
            {controller.isGlobal ? (
              <StatusBadge label="Configuración global" tone="info" />
            ) : controller.usesGlobal ? (
              <StatusBadge label="Usa la configuración global" tone="neutral" />
            ) : (
              <StatusBadge label="Propia de la categoría" tone="success" />
            )}
            {!controller.isGlobal && !controller.usesGlobal && (
              <Button size="sm" variant="outline" onClick={controller.askReset}>
                <RotateCcw aria-hidden="true" />
                Restablecer a la global
              </Button>
            )}
          </div>
        )}
      </div>

      {controller.overrides.length > 0 && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          Categorías con configuración propia:
          {controller.overrides.map((item) => (
            <button
              key={item.id_category ?? 'global'}
              type="button"
              className="rounded-full border border-border px-2 py-0.5 hover:border-primary hover:text-primary"
              onClick={() => controller.selectOverride(item.id_category)}
            >
              {item.name}
            </button>
          ))}
        </p>
      )}

      {controller.usesGlobal && (
        <p className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          {controller.scopeName} usa los valores globales. Si guardas, se crea una configuración
          propia solo para esta categoría.
        </p>
      )}

      {controller.isLoading ? (
        <LoadingSkeleton rows={3} label={`Cargando ${definition.title.toLowerCase()}`} />
      ) : controller.errorMessage || !config ? (
        <ErrorState
          message={controller.errorMessage ?? 'No pudimos cargar la configuración.'}
          onRetry={controller.retry}
        />
      ) : (
        <ConfigForm
          key={controller.formKey}
          definition={definition}
          values={config.values}
          forceSave={controller.usesGlobal}
          isSaving={controller.isSaving}
          onSave={controller.save}
        />
      )}

      <ConfirmDialog
        open={controller.confirmingReset}
        onOpenChange={(open) => !open && controller.cancelReset()}
        title={`¿Restablecer ${controller.scopeName} a la configuración global?`}
        description="Se elimina la configuración propia de esta categoría y vuelve a usar los valores globales."
        confirmLabel="Restablecer"
        onConfirm={controller.reset}
        pending={controller.isResetting}
      />
    </div>
  )
}
