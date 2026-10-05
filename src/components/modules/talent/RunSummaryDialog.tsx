import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface RunStat {
  label: string
  value: number
}

export interface RunFailure {
  id_user: number
  name: string
  mensaje: string
}

interface RunSummaryDialogProps {
  open: boolean
  title: string
  message: string
  stats: RunStat[]
  failures: RunFailure[]
  onClose: () => void
}

export function RunSummaryDialog({
  open,
  title,
  message,
  stats,
  failures,
  onClose,
}: RunSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border p-3">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="text-xl font-semibold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
        {failures.length > 0 && (
          <section aria-labelledby="run-failures" className="flex flex-col gap-2">
            <h3 id="run-failures" className="flex items-center gap-2 text-sm font-semibold">
              <CircleAlert aria-hidden="true" className="size-4 text-risk-high" />
              {failures.length === 1
                ? '1 deportista no se pudo procesar'
                : `${failures.length} deportistas no se pudieron procesar`}
            </h3>
            <ul className="flex max-h-56 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border">
              {failures.map((failure) => (
                <li key={failure.id_user} className="flex flex-col gap-0.5 p-3 text-sm">
                  <span className="font-medium">{failure.name}</span>
                  <span className="text-muted-foreground">{failure.mensaje}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <DialogFooter>
          <Button onClick={onClose}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
