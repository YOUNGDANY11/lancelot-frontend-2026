import { BarChart3, CalendarClock } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { MatchStatsSheet } from '@/components/modules/training/MatchStatsSheet'
import { Button } from '@/components/ui/button'
import { useTrainingMatchesController } from '@/controllers/training/useTrainingMatchesController'
import { formatDate } from '@/utils/formatDate'

export function TrainingMatchesTab() {
  const controller = useTrainingMatchesController()

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Selecciona una temporada"
        description="Los partidos se programan en Club → Partidos."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar description="Registra minutos, goles, tarjetas y el RPE de cada deportista después del partido. El RPE del partido suma a su carga." />
      <DataTable
        caption="Partidos de la temporada"
        rows={controller.matches}
        getRowKey={(match) => match.id_match}
        pagination={controller.pagination}
        onPageChange={controller.setPage}
        isLoading={controller.isLoading}
        errorMessage={controller.errorMessage}
        onRetry={controller.retry}
        emptyState={
          <EmptyState
            icon={CalendarClock}
            title="Aún no hay partidos en esta temporada"
            description="Prográmalos en Club → Partidos."
          />
        }
        columns={[
          {
            key: 'date',
            header: 'Fecha',
            cell: (match) => (
              <span className="font-medium tabular-nums">
                {formatDate(match.date)} · {match.time.slice(0, 5)}
              </span>
            ),
          },
          {
            key: 'competency',
            header: 'Competencia',
            cell: (match) => match.name_competency ?? '—',
          },
          { key: 'category', header: 'Categoría', cell: (match) => match.name_category ?? '—' },
          {
            key: 'stats',
            mobile: 'full',
            header: <span className="sr-only">Estadísticas</span>,
            className: 'text-right',
            cell: (match) =>
              controller.canRecord &&
              (controller.isPlayed(match) ? (
                <Button size="sm" variant="outline" onClick={() => controller.openStats(match)}>
                  <BarChart3 aria-hidden="true" />
                  Registrar estadísticas
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Aún no se juega</span>
              )),
          },
        ]}
      />
      <MatchStatsSheet match={controller.statsMatch} onClose={controller.closeStats} />
    </div>
  )
}
