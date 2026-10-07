import { CalendarRange, ChevronDown } from 'lucide-react'
import { SelectInput } from '@/components/common/SelectInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useContextSwitcherController } from '@/controllers/useContextSwitcherController'

type ContextSwitcherController = ReturnType<typeof useContextSwitcherController>

function ContextFields({
  controller,
  idPrefix,
}: {
  controller: ContextSwitcherController
  idPrefix: string
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-temporada`} className="text-xs text-muted-foreground">
          Temporada
        </Label>
        <SelectInput
          id={`${idPrefix}-temporada`}
          value={controller.seasonValue}
          onValueChange={controller.onSeasonChange}
          options={controller.seasonOptions}
          placeholder="Sin temporadas"
          disabled={!controller.hasSeasons}
          className="min-w-44"
        />
      </div>
      {controller.canChooseCategory ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-categoria`} className="text-xs text-muted-foreground">
            Categoría
          </Label>
          <SelectInput
            id={`${idPrefix}-categoria`}
            value={controller.categoryValue}
            onValueChange={controller.onCategoryChange}
            options={controller.categoryOptions}
            className="min-w-44"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Mi categoría</span>
          <span className="flex h-10 items-center text-sm font-medium">
            {controller.categoryLabel}
          </span>
        </div>
      )}
    </>
  )
}

export function ContextSwitcher() {
  const controller = useContextSwitcherController()

  if (controller.isLoading) return <Skeleton className="h-10 w-full max-w-48 rounded-lg" />

  return (
    <>
      <div className="hidden items-end gap-3 md:flex" role="group" aria-label="Contexto de trabajo">
        <ContextFields controller={controller} idPrefix="contexto" />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 max-w-full min-w-0 shrink justify-start gap-2 md:hidden"
            aria-label={`Contexto: ${controller.seasonLabel}, ${controller.categoryLabel}. Cambiar`}
          >
            <CalendarRange aria-hidden="true" className="text-primary" />
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="max-w-full truncate text-xs text-muted-foreground">
                {controller.seasonLabel}
              </span>
              <span className="max-w-full truncate text-sm">{controller.categoryLabel}</span>
            </span>
            <ChevronDown aria-hidden="true" className="ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-4 p-4"
        >
          <p className="font-heading font-semibold">Contexto de trabajo</p>
          <ContextFields controller={controller} idPrefix="contexto-movil" />
        </PopoverContent>
      </Popover>
    </>
  )
}
