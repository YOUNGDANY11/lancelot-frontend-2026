import { CalendarArrowUp, ClipboardCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { SelectInput } from '@/components/common/SelectInput'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { RunSummaryDialog } from '@/components/modules/talent/RunSummaryDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PLAN_FOCUS_DIMENSION } from '@/constants/enums'
import { APP_MODULES } from '@/constants/navigation'
import { useNextCycleController } from '@/controllers/talent/useNextCycleController'
import { formatNumber } from '@/utils/formatNumber'
import { fullName } from '@/utils/text'

export function NextCycleTab() {
  const controller = useNextCycleController()
  const { target } = controller

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={CalendarArrowUp}
        title="Selecciona una temporada"
        description="El siguiente ciclo se planifica a partir de una temporada."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={`Propuesta para después de ${controller.season?.name}: la categoría según la edad que cumplirá cada deportista, un ascenso si su señalización de talento quedó revisada, la dimensión más baja de su índice como foco y sus objetivos en curso. Nada cambia hasta que apliques el plan.`}
      >
        {controller.canApply && (
          <Button onClick={controller.askApply} disabled={controller.applicableCount === 0}>
            <ClipboardCheck aria-hidden="true" />
            Aplicar plan ({controller.applicableCount})
          </Button>
        )}
      </TabToolbar>

      <div className="flex flex-col gap-1.5 sm:max-w-72">
        <Label htmlFor="next-cycle-target">Temporada del siguiente ciclo</Label>
        <SelectInput
          id="next-cycle-target"
          value={controller.targetValue}
          onValueChange={controller.onTargetChange}
          options={controller.targetOptions}
          placeholder="No hay temporadas posteriores"
          disabled={controller.targetOptions.length === 0}
        />
      </div>

      {!controller.isLoading && !controller.errorMessage && !target && (
        <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          Crea la temporada siguiente en Club → Temporadas para poder aplicar el plan. Mientras
          tanto, la propuesta usa la edad que cumplirán el próximo año.
        </p>
      )}
      {target?.status === 'closed' && (
        <p className="flex items-start gap-2 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-risk-medium" />
          {target.name} está cerrada; elige una temporada planeada o activa para aplicar el plan.
        </p>
      )}
      {!controller.canPlan && (
        <p className="text-sm text-muted-foreground">
          El director técnico o el administrador aplican el plan.
        </p>
      )}

      <DataTable
        caption="Plan del siguiente ciclo"
        rows={controller.rows}
        getRowKey={(row) => row.athlete.id_user}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={CalendarArrowUp}
            title="No hay deportistas asignados en esta temporada"
            description="El plan parte de la plantilla de la temporada seleccionada."
          />
        }
        columns={[
          {
            key: 'athlete',
            header: 'Deportista',
            cell: ({ athlete, decision }) => {
              const name = fullName(athlete)
              return (
                <span className="flex items-start gap-2">
                  {controller.canApply && (
                    <Checkbox
                      checked={decision.include}
                      disabled={athlete.eligible_category_ids.length === 0}
                      onCheckedChange={(checked) =>
                        controller.toggleInclude(athlete.id_user, checked === true)
                      }
                      aria-label={`Incluir a ${name} en el plan`}
                      className="mt-0.5"
                    />
                  )}
                  <span className="flex flex-col">
                    <Link
                      to={`${APP_MODULES.athletes.path}/${athlete.id_user}`}
                      className="font-medium hover:underline"
                    >
                      {name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {[athlete.current_category?.name, athlete.position]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {athlete.planned_categories.length > 0 && (
                      <StatusBadge
                        label={`Ya asignado en ${athlete.planned_categories.join(', ')}`}
                        tone="success"
                        className="mt-1 self-start"
                      />
                    )}
                  </span>
                </span>
              )
            },
          },
          {
            key: 'age',
            header: `Edad en ${controller.plan?.reference_year ?? ''}`,
            className: 'tabular-nums',
            cell: ({ athlete }) =>
              athlete.sporting_age !== null ? `${athlete.sporting_age} años` : 'Sin fecha',
          },
          {
            key: 'category',
            header: 'Categoría propuesta',
            cell: ({ athlete, decision }) => (
              <span className="flex min-w-44 flex-col gap-1">
                {controller.canApply && athlete.eligible_category_ids.length > 0 ? (
                  <SelectInput
                    aria-label={`Categoría de ${fullName(athlete)} en el siguiente ciclo`}
                    value={decision.idCategory !== null ? String(decision.idCategory) : undefined}
                    onValueChange={(value) => controller.changeCategory(athlete.id_user, value)}
                    options={controller.categoryOptionsFor(athlete)}
                  />
                ) : (
                  <span className="font-medium">{athlete.suggested_category?.name ?? '—'}</span>
                )}
                <span className="text-xs text-muted-foreground">{athlete.suggestion_reason}</span>
              </span>
            ),
          },
          {
            key: 'promotion',
            header: 'Ascenso',
            cell: ({ athlete, decision }) =>
              athlete.promotion_category ? (
                <span className="flex flex-col gap-1">
                  {controller.canApply ? (
                    <span className="flex items-center gap-2">
                      <Checkbox
                        id={`promotion-${athlete.id_user}`}
                        checked={decision.promote}
                        onCheckedChange={(checked) =>
                          controller.togglePromote(athlete.id_user, checked === true)
                        }
                      />
                      <Label htmlFor={`promotion-${athlete.id_user}`}>
                        También en {athlete.promotion_category.name}
                      </Label>
                    </span>
                  ) : (
                    <span className="font-medium">{athlete.promotion_category.name}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{athlete.promotion_reason}</span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {athlete.promotion_reason ?? 'Sin señalización de talento revisada'}
                </span>
              ),
          },
          {
            key: 'focus',
            header: 'Foco del ciclo',
            cell: ({ athlete }) =>
              athlete.focus_dimension ? (
                <span className="flex flex-col">
                  <span className="font-medium">
                    {PLAN_FOCUS_DIMENSION.labels[athlete.focus_dimension]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(athlete.focus_score, 0)} de 100 en su índice
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Sin índice en la temporada</span>
              ),
          },
          {
            key: 'objectives',
            header: 'Objetivos en curso',
            cell: ({ athlete, decision }) =>
              athlete.open_objectives.length === 0 ? (
                <span className="text-xs text-muted-foreground">Ninguno</span>
              ) : controller.canApply ? (
                <span className="flex items-center gap-2">
                  <Checkbox
                    id={`carry-${athlete.id_user}`}
                    checked={decision.carry}
                    onCheckedChange={(checked) =>
                      controller.toggleCarry(athlete.id_user, checked === true)
                    }
                  />
                  <Label htmlFor={`carry-${athlete.id_user}`}>
                    Llevar {athlete.open_objectives.length}
                  </Label>
                </span>
              ) : (
                <span className="tabular-nums">{athlete.open_objectives.length}</span>
              ),
          },
        ]}
      />

      <ConfirmDialog
        open={controller.confirming}
        onOpenChange={(open) => !open && controller.cancelApply()}
        title={`¿Aplicar el plan en ${target?.name ?? 'la temporada siguiente'}?`}
        description={`Se asignan ${controller.applicableCount} deportistas a su categoría en ${target?.name ?? 'la temporada siguiente'}, también a la categoría superior cuando marcaste el ascenso, y se copian los objetivos en curso que elegiste llevar. Las asignaciones que ya existen no se duplican.`}
        confirmLabel="Aplicar plan"
        onConfirm={controller.apply}
        pending={controller.isApplying}
      />
      <RunSummaryDialog
        open={controller.summary !== null}
        title="Plan del siguiente ciclo"
        message={controller.summary?.mensaje ?? ''}
        stats={[
          { label: 'Asignaciones nuevas', value: controller.summary?.assigned ?? 0 },
          { label: 'Ya existían', value: controller.summary?.skipped ?? 0 },
          { label: 'Objetivos llevados', value: controller.summary?.objectives_carried ?? 0 },
          { label: 'Con error', value: controller.summary?.failed.length ?? 0 },
        ]}
        failures={(controller.summary?.failed ?? []).map((failure) => ({
          ...failure,
          name: controller.nameOf(failure.id_user),
        }))}
        onClose={controller.closeSummary}
      />
    </div>
  )
}
