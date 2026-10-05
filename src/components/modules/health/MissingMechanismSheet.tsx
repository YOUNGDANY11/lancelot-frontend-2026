import { CircleCheck } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { MechanismChoice } from '@/components/modules/health/MechanismChoice'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { INJURY_SEVERITY } from '@/constants/enums'
import { useMissingMechanismController } from '@/controllers/health/useMissingMechanismController'
import { formatDate } from '@/utils/formatDate'

interface MissingMechanismSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MissingMechanismSheet({ open, onOpenChange }: MissingMechanismSheetProps) {
  const controller = useMissingMechanismController(open)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border p-5 pr-12">
          <SheetTitle className="text-lg">Completar el mecanismo</SheetTitle>
          <SheetDescription>
            Indica si cada lesión fue con o sin contacto. Solo las lesiones sin contacto alimentan
            el modelo de riesgo. Se guarda al elegir.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {controller.isLoading ? (
            <LoadingSkeleton rows={3} label="Cargando lesiones sin mecanismo" />
          ) : controller.errorMessage ? (
            <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
          ) : controller.injuries.length === 0 ? (
            <EmptyState
              icon={CircleCheck}
              title="Todas las lesiones tienen mecanismo"
              description="Así el modelo de riesgo aprende con datos completos."
            />
          ) : (
            <ul aria-label="Lesiones sin mecanismo" className="flex flex-col gap-3">
              {controller.injuries.map((injury) => {
                const athlete = injury.athlete_name || 'Deportista'
                return (
                  <li
                    key={injury.id_injury}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{athlete}</p>
                      <p className="text-sm text-muted-foreground">
                        {injury.body_part} · {INJURY_SEVERITY.labels[injury.severity]} ·{' '}
                        {formatDate(injury.injury_date)}
                      </p>
                    </div>
                    <MechanismChoice
                      name={`mecanismo-${injury.id_injury}`}
                      legend={`Mecanismo de la lesión de ${athlete} del ${formatDate(injury.injury_date)}`}
                      hideLegend
                      compact
                      value={injury.mechanism}
                      disabled={controller.savingId === injury.id_injury}
                      onChange={(mechanism) => controller.setMechanism(injury, mechanism)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
