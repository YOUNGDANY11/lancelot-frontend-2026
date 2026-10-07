import { Activity, Flag, ShieldAlert, Trophy, Users } from 'lucide-react'
import { Link } from 'react-router'
import { AlertsByCategoryBar } from '@/components/charts/AlertsByCategoryBar'
import { KpiCard } from '@/components/common/KpiCard'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SetupChecklist } from '@/components/common/SetupChecklist'
import { HomeSection } from '@/components/modules/home/HomeSection'
import { useDirectorHomeController } from '@/controllers/home/useDirectorHomeController'
import { formatNumber } from '@/utils/formatNumber'

export function DirectorHome() {
  const controller = useDirectorHomeController()
  const { kpis } = controller

  return (
    <div className="flex flex-col gap-5">
      <section aria-label={`Resumen de ${controller.seasonName ?? 'la temporada'}`}>
        {kpis.isLoading ? (
          <LoadingSkeleton variant="cards" rows={4} label="Cargando el resumen de la temporada" />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard
              label="Deportistas"
              value={kpis.athletes}
              hint={controller.seasonName ? `En ${controller.seasonName}` : 'Sin temporada'}
              icon={Users}
            />
            <KpiCard
              label="Sesiones"
              value={kpis.sessions}
              hint="Programadas en la temporada"
              icon={Activity}
            />
            <KpiCard
              label="Alertas abiertas"
              value={kpis.openAlerts}
              hint="Fatiga y riesgo sin revisar"
              icon={ShieldAlert}
            />
            <KpiCard
              label="Talento por revisar"
              value={kpis.openFlags}
              hint="Señalizaciones pendientes"
              icon={Flag}
              helpTerm="talentDetection"
            />
          </div>
        )}
      </section>

      <SetupChecklist />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {controller.isLoadingAlerts ? (
          <LoadingSkeleton variant="cards" rows={1} label="Cargando alertas por categoría" />
        ) : (
          <AlertsByCategoryBar categories={controller.alertsByCategory} />
        )}

        <HomeSection
          id="top-indice"
          title="Top 5 del índice de progreso"
          icon={Trophy}
          linkTo={controller.paths.talent}
          linkLabel="Ver ranking"
        >
          {controller.isLoadingIndices ? (
            <LoadingSkeleton rows={3} label="Cargando índices" />
          ) : controller.topIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay índices calculados en esta temporada.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-border">
              {controller.topIndices.map((entry) => (
                <li key={entry.index.id_index} className="flex items-center gap-3 py-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
                    {entry.rank}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      to={controller.athletePath(entry.index.id_user)}
                      className="truncate font-medium hover:underline"
                    >
                      {entry.athleteName}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {[entry.category_name, entry.position].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatNumber(entry.index.index_value, 1)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </HomeSection>
      </div>
    </div>
  )
}
