import { Flag, Plus, Scale, ScanSearch } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { HelpHint } from '@/components/common/HelpHint'
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton'
import { SelectInput } from '@/components/common/SelectInput'
import { TabToolbar } from '@/components/modules/club/TabToolbar'
import { RunSummaryDialog } from '@/components/modules/talent/RunSummaryDialog'
import { TalentFlagCard } from '@/components/modules/talent/TalentFlagCard'
import { TalentFlagFormSheet } from '@/components/modules/talent/TalentFlagFormSheet'
import { Button } from '@/components/ui/button'
import { useTalentFlagsController } from '@/controllers/talent/useTalentFlagsController'

export function TalentFlagsTab() {
  const controller = useTalentFlagsController()
  const { summary } = controller

  if (!controller.hasSeason) {
    return (
      <EmptyState
        icon={Flag}
        title="Selecciona una temporada"
        description="Las señalizaciones de talento se registran por temporada."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar
        description={
          <span className="flex items-center gap-1">
            Sugerencias de talento de {controller.season?.name}. Al cerrar la temporada, el sistema
            ejecuta la detección automáticamente.
            <HelpHint term="talentDetection" />
          </span>
        }
      >
        <Button variant="outline" onClick={controller.manualSheet.open}>
          <Plus aria-hidden="true" />
          Señalización manual
        </Button>
        {controller.canDetect && (
          <Button onClick={controller.askDetect}>
            <ScanSearch aria-hidden="true" />
            Detectar talento
          </Button>
        )}
      </TabToolbar>

      <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <Scale aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-pretty">
          <span className="font-semibold">El sistema sugiere; tú decides. </span>
          <span className="text-muted-foreground">
            Una señalización no asciende a nadie: revisa los criterios y las advertencias, como el
            efecto de edad relativa, antes de tomar una decisión.
          </span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <SelectInput
          aria-label="Filtrar por estado"
          value={controller.status}
          onValueChange={controller.setStatus}
          options={controller.statusOptions}
        />
        <SelectInput
          aria-label="Filtrar por origen"
          value={controller.source}
          onValueChange={controller.setSource}
          options={controller.sourceOptions}
        />
      </div>

      {controller.isLoading ? (
        <LoadingSkeleton variant="cards" rows={3} label="Cargando señalizaciones" />
      ) : controller.errorMessage ? (
        <ErrorState message={controller.errorMessage} onRetry={controller.retry} />
      ) : controller.flags.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No hay señalizaciones con esos filtros"
          description="Cuando el sistema o el cuerpo técnico señalen un talento, aparecerá aquí."
        />
      ) : (
        <ul aria-label="Señalizaciones de talento" className="grid gap-3 lg:grid-cols-2">
          {controller.flags.map((flag) => (
            <li key={flag.id_flag}>
              <TalentFlagCard
                flag={flag}
                athletePath={controller.athletePath(flag)}
                isPending={controller.pendingFlag === flag.id_flag}
                onDecide={(next) => controller.decide(flag, next)}
              />
            </li>
          ))}
        </ul>
      )}

      <TalentFlagFormSheet
        open={controller.manualSheet.isOpen}
        onOpenChange={controller.manualSheet.setIsOpen}
      />
      <ConfirmDialog
        open={controller.confirmingDetect}
        onOpenChange={(open) => !open && controller.cancelDetect()}
        title={`¿Detectar talento en ${controller.season?.name ?? 'la temporada'}?`}
        description="Primero se recalculan los índices y después se aplican las reglas de talento. Las señalizaciones ya revisadas no cambian."
        confirmLabel="Detectar"
        onConfirm={controller.detect}
        pending={controller.isDetecting}
      />
      <RunSummaryDialog
        open={summary !== null}
        title="Detección de talento"
        message={summary?.mensaje ?? ''}
        stats={[
          { label: 'Evaluados', value: summary?.evaluated ?? 0 },
          { label: 'Señalados', value: summary?.flagged ?? 0 },
          { label: 'Nuevos', value: summary?.created ?? 0 },
          { label: 'Actualizados', value: summary?.updated ?? 0 },
          { label: 'Ya revisados', value: summary?.skipped ?? 0 },
          { label: 'Retirados', value: summary?.removed ?? 0 },
        ]}
        failures={(summary?.failed ?? []).map((failure) => ({
          ...failure,
          name: controller.nameOf(failure.id_user),
        }))}
        onClose={controller.closeSummary}
      />
    </div>
  )
}
