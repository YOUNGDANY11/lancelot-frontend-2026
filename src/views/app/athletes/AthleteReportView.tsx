import { ArrowLeft, CalendarX, Printer } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SelectInput } from '@/components/common/SelectInput'
import { AthleteReport } from '@/components/modules/athletes/AthleteReport'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAthleteReportController } from '@/controllers/athletes/useAthleteReportController'

export default function AthleteReportView() {
  const { id_user: rawId } = useParams()
  const report = useAthleteReportController(rawId)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to={report.profilePath}>
            <ArrowLeft aria-hidden="true" />
            Volver a la ficha
          </Link>
        </Button>
        {report.summary && (
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="report-stage" className="text-sm text-muted-foreground">
              Versión
            </Label>
            <SelectInput
              id="report-stage"
              value={report.stageValue}
              onValueChange={report.onStageChange}
              options={report.stageOptions}
              className="w-64"
            />
            <Button onClick={report.print}>
              <Printer aria-hidden="true" />
              Imprimir o guardar en PDF
            </Button>
          </div>
        )}
      </div>

      {!report.hasSeason ? (
        <EmptyState
          icon={CalendarX}
          title="Elige una temporada"
          description="El informe se genera para la temporada seleccionada en la barra superior."
        />
      ) : report.isLoading ? (
        <LoadingSkeleton variant="cards" rows={4} label="Preparando el informe" />
      ) : report.errorMessage ? (
        <ErrorState message={report.errorMessage} onRetry={report.retry} />
      ) : (
        <AthleteReport report={report} />
      )}
    </div>
  )
}
