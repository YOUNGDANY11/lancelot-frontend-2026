import { FormAlert } from '@/components/common/FormAlert'
import { FormField } from '@/components/common/FormField'
import { FormModal } from '@/components/common/FormModal'
import { HelpHint } from '@/components/common/HelpHint'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useCategoryFormController } from '@/controllers/forms/useCategoryFormController'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CategoryFormContent({ onOpenChange }: Omit<DialogProps, 'open'>) {
  const { form, onSubmit, isSubmitting, serverError } = useCategoryFormController({
    onDone: () => onOpenChange(false),
  })
  const { errors } = form.formState

  return (
    <FormModal
      open
      onOpenChange={onOpenChange}
      title="Crear categoría"
      description="Agrupa a los deportistas por rango de edad."
      submitLabel="Crear categoría"
      pendingLabel="Creando…"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <FormAlert message={serverError} />
        <FormField id="category-name" label="Nombre" error={errors.name?.message}>
          {(controlProps) => (
            <Input {...controlProps} placeholder="Sub-15" autoFocus {...form.register('name')} />
          )}
        </FormField>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          Rango de edades
          <HelpHint term="multiAgeCategory" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <FormField id="category-min-age" label="Edad mínima" error={errors.min_age?.message}>
            {(controlProps) => (
              <Input
                {...controlProps}
                inputMode="numeric"
                placeholder="13"
                {...form.register('min_age')}
              />
            )}
          </FormField>
          <FormField id="category-max-age" label="Edad máxima" error={errors.max_age?.message}>
            {(controlProps) => (
              <Input
                {...controlProps}
                inputMode="numeric"
                placeholder="15"
                {...form.register('max_age')}
              />
            )}
          </FormField>
        </div>
      </FieldGroup>
    </FormModal>
  )
}

export function CategoryFormDialog({ open, onOpenChange }: DialogProps) {
  return open ? <CategoryFormContent onOpenChange={onOpenChange} /> : null
}
