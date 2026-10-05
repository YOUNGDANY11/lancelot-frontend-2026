import { Users } from 'lucide-react'
import { TeamAcwrScatter } from '@/components/charts/TeamAcwrScatter'
import { DataTable } from '@/components/common/DataTable'
import { DateField } from '@/components/common/DateField'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LevelBadge } from '@/components/common/LevelBadge'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SelectInput } from '@/components/common/SelectInput'
import { Label } from '@/components/ui/label'
import { useTeamLoadController } from '@/controllers/training/useTeamLoadController'
import { formatNumber } from '@/utils/formatNumber'
import { fullName } from '@/utils/text'
import { todayApiDate } from '@/utils/formatDate'

export function TeamLoadTab() {
  const controller = useTeamLoadController()

  if (!controller.hasCategories) {
    return (
      <EmptyState
        icon={Users}
        title="Aún no hay categorías"
        description="La carga del equipo se consulta por categoría."
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {controller.canChooseCategory && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-load-category">Categoría</Label>
            <SelectInput
              id="team-load-category"
              value={controller.categoryValue}
              onValueChange={controller.onCategoryChange}
              options={controller.categoryOptions}
              className="min-w-44"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="team-load-date">Fecha</Label>
          <DateField
            id="team-load-date"
            value={controller.date}
            max={todayApiDate()}
            onChange={(event) => controller.setDate(event.target.value)}
            className="w-44"
          />
        </div>
        {controller.team && (
          <p className="text-sm text-muted-foreground sm:pb-2">
            {controller.team.category.name}
            {controller.team.season ? ` · ${controller.team.season.name}` : ''}
          </p>
        )}
      </div>

      {controller.isLoading ? (
        <LoadingSkeleton variant="table" label="Calculando el ACWR del equipo" />
      ) : controller.errorMessage || !controller.team ? (
        <ErrorState
          message={controller.errorMessage ?? 'No pudimos calcular la carga.'}
          onRetry={controller.retry}
        />
      ) : !controller.team.season ? (
        <EmptyState
          icon={Users}
          title="No hay una temporada activa"
          description="La carga del equipo usa la plantilla de la temporada activa."
        />
      ) : (
        <>
          <TeamAcwrScatter athletes={controller.athletes} thresholds={controller.team.thresholds} />
          <DataTable
            caption="ACWR de la plantilla"
            rows={controller.athletes}
            getRowKey={(athlete) => athlete.id_user}
            onRowClick={controller.openAthlete}
            emptyState={
              <EmptyState
                icon={Users}
                title="La plantilla de esta categoría está vacía"
                description="Asigna deportistas en Club → Plantilla."
              />
            }
            columns={[
              {
                key: 'name',
                header: 'Deportista',
                cell: (athlete) => (
                  <button
                    type="button"
                    className="text-left font-medium underline-offset-4 hover:text-primary hover:underline"
                    onClick={(event) => {
                      event.stopPropagation()
                      controller.openAthlete(athlete)
                    }}
                  >
                    {fullName(athlete)}
                  </button>
                ),
              },
              {
                key: 'acwr',
                header: (
                  <span className="flex items-center gap-1">
                    ACWR <HelpHint term="acwr" />
                  </span>
                ),
                cell: (athlete) =>
                  athlete.acwr === null ? (
                    <span className="text-muted-foreground">Sin datos</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">
                        {formatNumber(athlete.acwr, 2)}
                      </span>
                      {athlete.level && <LevelBadge level={athlete.level} />}
                    </span>
                  ),
              },
              {
                key: 'acute',
                header: 'Aguda',
                cell: (athlete) => (
                  <span className="tabular-nums">{formatNumber(athlete.acute_load, 0)}</span>
                ),
              },
              {
                key: 'chronic',
                header: 'Crónica',
                cell: (athlete) => (
                  <span className="tabular-nums">{formatNumber(athlete.chronic_load, 0)}</span>
                ),
              },
              {
                key: 'sessions',
                header: 'Sesiones (7 días)',
                cell: (athlete) => <span className="tabular-nums">{athlete.sessions_7d}</span>,
              },
              { key: 'position', header: 'Posición', cell: (athlete) => athlete.position ?? '—' },
            ]}
          />
          {controller.withoutData > 0 && (
            <p className="text-sm text-muted-foreground">
              {controller.withoutData === 1
                ? '1 deportista aún no tiene carga suficiente para calcular el ACWR.'
                : `${controller.withoutData} deportistas aún no tienen carga suficiente para calcular el ACWR.`}
            </p>
          )}
        </>
      )}
    </div>
  )
}
