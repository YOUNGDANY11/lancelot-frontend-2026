import { Loader2, UserMinus, UserPlus, Users } from 'lucide-react'
import { AthletePicker } from '@/components/common/AthletePicker'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCallUpsController } from '@/controllers/club/useCallUpsController'
import type { Competency } from '@/types/competition'
import { fullName } from '@/utils/text'

function CallUpsContent({ competency, onClose }: { competency: Competency; onClose: () => void }) {
  const controller = useCallUpsController(competency)

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 pr-12">
          <SheetTitle className="text-lg">Convocatoria</SheetTitle>
          <SheetDescription>{competency.name}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
          {controller.canManage && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="callup-athlete">Convocar deportista</Label>
              <p className="text-sm text-muted-foreground">
                Primero la plantilla de esta categoría; después, quienes por edad también pueden
                jugarla. Nadie mayor al límite de la categoría.
              </p>
              <AthletePicker
                id="callup-athlete"
                options={controller.options}
                value={controller.selectedAthlete}
                onChange={controller.setSelectedAthlete}
                isLoading={controller.isLoadingOptions}
                emptyMessage="No hay más deportistas habilitados por edad para convocar."
              />
              <Button
                onClick={controller.add}
                disabled={!controller.selectedAthlete || controller.isAdding}
                className="self-end"
              >
                {controller.isAdding ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus aria-hidden="true" />
                )}
                Convocar
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              Convocados{' '}
              <span className="text-muted-foreground">({controller.callUps.length})</span>
            </p>
            {controller.isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : controller.errorMessage ? (
              <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
            ) : controller.callUps.length === 0 ? (
              <EmptyState icon={Users} title="Aún no hay convocados" />
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {controller.callUps.map((callUp) => (
                  <li
                    key={callUp.id_ath_comp}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{fullName(callUp)}</span>
                    {controller.canManage && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Quitar a ${fullName(callUp)} de la convocatoria`}
                        onClick={() => controller.requestRemove(callUp)}
                      >
                        <UserMinus aria-hidden="true" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <ConfirmDialog
          open={controller.removing !== null}
          onOpenChange={(open) => !open && controller.cancelRemove()}
          title={`¿Quitar a ${controller.removing ? fullName(controller.removing) : ''} de la convocatoria?`}
          description="Podrás convocarlo de nuevo cuando quieras."
          confirmLabel="Quitar"
          onConfirm={controller.confirmRemove}
          pending={controller.isRemoving}
          destructive
        />
      </SheetContent>
    </Sheet>
  )
}

export function CallUpsSheet({
  competency,
  onClose,
}: {
  competency: Competency | null
  onClose: () => void
}) {
  return competency ? (
    <CallUpsContent key={competency.id_competency} competency={competency} onClose={onClose} />
  ) : null
}
