import { CircleCheck, CircleDashed, Lock, UserCog } from 'lucide-react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { ActivateSeasonDialog } from '@/components/modules/club/ActivateSeasonDialog'
import { AthleteAssignmentFormDialog } from '@/components/modules/club/AthleteAssignmentFormDialog'
import { CategoryFormDialog } from '@/components/modules/club/CategoryFormDialog'
import { SeasonFormDialog } from '@/components/modules/club/SeasonFormDialog'
import { ParentalConsentFormSheet } from '@/components/modules/health/ParentalConsentFormSheet'
import { UserAccountFormSheet } from '@/components/modules/settings/UserAccountFormSheet'
import { WeightProfileFormDialog } from '@/components/modules/settings/WeightProfileFormDialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SETUP_ACTION_LABELS, SETUP_TEXTS, type SetupAction } from '@/constants/setupChecklist'
import { useSetupChecklistController } from '@/controllers/useSetupChecklistController'
import { cn } from '@/lib/utils'
import type { SetupStep, SetupStepStatus } from '@/utils/setupChecklist'

const STATUS_PRESENTATION: Record<
  SetupStepStatus,
  { icon: typeof CircleCheck; label: string; className: string }
> = {
  done: { icon: CircleCheck, label: SETUP_TEXTS.done, className: 'text-risk-low' },
  pending: { icon: CircleDashed, label: SETUP_TEXTS.pending, className: 'text-primary' },
  blocked: { icon: Lock, label: SETUP_TEXTS.blocked, className: 'text-muted-foreground' },
  'other-role': { icon: UserCog, label: SETUP_TEXTS.adminOnly, className: 'text-muted-foreground' },
}

function StepItem({
  step,
  index,
  isPrimary,
  onAction,
}: {
  step: SetupStep
  index: number
  isPrimary: boolean
  onAction: (action: SetupAction) => void
}) {
  const status = STATUS_PRESENTATION[step.status]
  const showAction = step.action && step.status === 'pending'

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <status.icon
          aria-hidden="true"
          className={cn('mt-0.5 size-5 shrink-0', status.className)}
        />
        <div className="flex flex-col gap-0.5">
          <p className={cn('font-medium', step.status === 'done' && 'text-muted-foreground')}>
            <span className="sr-only">{`Paso ${index + 1}, ${status.label}: `}</span>
            {step.title}
          </p>
          <p className="text-sm text-muted-foreground">{step.detail}</p>
        </div>
      </div>
      {showAction && step.action && (
        <Button
          size="sm"
          variant={isPrimary ? 'default' : 'outline'}
          className="shrink-0 self-start sm:self-center"
          onClick={() => step.action && onAction(step.action)}
        >
          {SETUP_ACTION_LABELS[step.action]}
        </Button>
      )}
    </li>
  )
}

export function SetupChecklist() {
  const controller = useSetupChecklistController()
  if (!controller.isVisible) return null

  const { summary, openAction } = controller
  const primaryStepKey = controller.steps.find(
    (step) => step.status === 'pending' && step.action,
  )?.key
  const percent = summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0
  const dialogProps = (action: SetupAction) => ({
    open: openAction === action,
    onOpenChange: (open: boolean) => (open ? controller.open(action) : controller.close()),
  })

  return (
    <section
      aria-labelledby="setup-checklist-title"
      className="flex flex-col gap-5 rounded-2xl glass-subtle p-5 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="setup-checklist-title" className="text-xl font-semibold">
          {SETUP_TEXTS.title}
        </h2>
        <p className="text-sm text-muted-foreground">{SETUP_TEXTS.description}</p>
      </div>

      {controller.isLoading ? (
        <LoadingSkeleton variant="list" rows={6} label="Revisando la configuración del club" />
      ) : controller.errorMessage ? (
        <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {SETUP_TEXTS.progress(summary.done, summary.total)}
              </span>
              <span className="text-muted-foreground tabular-nums">{percent} %</span>
            </div>
            <Progress value={percent} aria-label="Avance de la configuración" />
          </div>
          <ol className="flex flex-col gap-3">
            {controller.steps.map((step, index) => (
              <StepItem
                key={step.key}
                step={step}
                index={index}
                isPrimary={step.key === primaryStepKey}
                onAction={controller.open}
              />
            ))}
          </ol>
        </>
      )}

      <SeasonFormDialog {...dialogProps('createSeason')} />
      <ActivateSeasonDialog {...dialogProps('activateSeason')} />
      <CategoryFormDialog {...dialogProps('createCategory')} />
      <WeightProfileFormDialog {...dialogProps('createWeightProfile')} />
      <UserAccountFormSheet {...dialogProps('createStaffAccount')} defaultRole="ENTRENADOR" />
      <UserAccountFormSheet {...dialogProps('createAthleteAccount')} defaultRole="DEPORTISTA" />
      <AthleteAssignmentFormDialog {...dialogProps('assignAthlete')} />
      <ParentalConsentFormSheet {...dialogProps('registerConsent')} />
    </section>
  )
}
