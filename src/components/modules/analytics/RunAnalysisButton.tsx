import { CircleAlert, CircleCheck, Zap } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { APP_MODULES } from '@/constants/navigation'
import { useRunAnalysisController } from '@/controllers/analytics/useRunAnalysisController'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'
import { describeRunSteps } from '@/utils/runAnalysis'

export function RunAnalysisButton({ className }: { className?: string }) {
  const controller = useRunAnalysisController()
  const { result } = controller
  if (!controller.canRun) return null

  return (
    <>
      <Button onClick={controller.run} disabled={controller.isRunning} className={className}>
        <Zap aria-hidden="true" />
        {controller.isRunning ? 'Analizando…' : 'Ejecutar análisis ahora'}
      </Button>

      <Dialog open={result !== null} onOpenChange={(open) => !open && controller.close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Análisis inmediato</DialogTitle>
            <DialogDescription>
              {result
                ? `Se ejecutó con los datos registrados hasta ahora, para el ${formatDate(result.date)}, en ${formatNumber(result.duration_ms / 1000, 1)} s. Es el mismo análisis que corre cada noche.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {result && (
            <>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <dt className="text-xs text-muted-foreground">Alertas de fatiga abiertas hoy</dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {result.open_today.fatigue_alerts}
                  </dd>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <dt className="text-xs text-muted-foreground">
                    Evaluaciones de riesgo abiertas hoy
                  </dt>
                  <dd className="text-xl font-semibold tabular-nums">
                    {result.open_today.risk_assessments}
                  </dd>
                </div>
              </dl>
              <ul aria-label="Pasos del análisis" className="flex flex-col gap-2">
                {describeRunSteps(result).map((step) => (
                  <li key={step.label} className="flex items-start gap-2 text-sm">
                    {step.ok ? (
                      <CircleCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-risk-low"
                      />
                    ) : (
                      <CircleAlert
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-risk-high"
                      />
                    )}
                    <span className="flex flex-col">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-muted-foreground">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Las alertas abiertas del día se actualizan con los datos nuevos; las que ya
                revisaste o descartaste no cambian.
              </p>
            </>
          )}
          <DialogFooter>
            <Button asChild variant="outline">
              <Link to={APP_MODULES.health.path} onClick={controller.close}>
                Ver la bandeja de alertas
              </Link>
            </Button>
            <Button onClick={controller.close}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
