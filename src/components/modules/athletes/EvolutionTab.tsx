import { History } from 'lucide-react'
import { SeasonComparisonChart } from '@/components/charts/SeasonComparisonChart'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { useEvolutionTabController } from '@/controllers/athletes/useEvolutionTabController'

export function EvolutionTab({ idUser }: { idUser: number }) {
  const { comparison, history } = useEvolutionTabController(idUser)

  return (
    <div className="flex flex-col gap-5">
      {comparison.visible &&
        (comparison.isLoading ? (
          <LoadingSkeleton variant="cards" rows={1} />
        ) : comparison.errorMessage ? (
          <ErrorState message={comparison.errorMessage} onRetry={comparison.retry} />
        ) : (
          <SeasonComparisonChart comparison={comparison.points} />
        ))}

      {history.visible && (
        <section className="flex flex-col gap-3 rounded-2xl glass-subtle p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <History aria-hidden="true" className="size-5 text-primary" />
            Historial de categorías
          </h3>
          {history.isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : history.errorMessage ? (
            <ErrorState message={history.errorMessage} onRetry={history.retry} />
          ) : history.items.length === 0 ? (
            <EmptyState icon={History} title="Aún no tiene categorías asignadas" className="py-6" />
          ) : (
            <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
              {history.items.map((item) => (
                <li key={item.id_ath_cat} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-background"
                  />
                  <p className="font-medium">{item.category_name ?? 'Categoría'}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.seasonName}
                    {item.position ? ` · ${item.position}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  )
}
