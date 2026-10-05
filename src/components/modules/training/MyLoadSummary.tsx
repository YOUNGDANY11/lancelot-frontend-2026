import { Link } from 'react-router'
import { AcwrTrendChart } from '@/components/charts/AcwrTrendChart'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { useMyLoadController } from '@/controllers/training/useMyLoadController'

export function MyLoadSummary() {
  const controller = useMyLoadController()

  if (controller.isLoading)
    return <LoadingSkeleton variant="cards" rows={1} label="Cargando tu carga" />
  if (controller.errorMessage || !controller.thresholds) {
    return (
      <ErrorState
        message={controller.errorMessage ?? 'No pudimos cargar tu carga.'}
        onRetry={controller.retry}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AcwrTrendChart
        series={controller.series}
        thresholds={controller.thresholds}
        title="Mi ACWR de las últimas 6 semanas"
      />
      <Button asChild variant="outline" className="self-start">
        <Link to={controller.profileLoadPath}>Ver toda mi carga</Link>
      </Button>
    </div>
  )
}
