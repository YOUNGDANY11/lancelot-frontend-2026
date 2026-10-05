import { Activity, CircleCheck, ShieldAlert, UserRound, X } from 'lucide-react'
import { Link } from 'react-router'
import { HelpHint } from '@/components/common/HelpHint'
import { LevelBadge } from '@/components/common/LevelBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { INJURY_RISK_RULE, RISK_ASSESSMENT_METHOD } from '@/constants/enums'
import { INBOX_KIND_LABELS } from '@/constants/health'
import { cn } from '@/lib/utils'
import type { InboxItem, ReviewDecision } from '@/types/health'
import { formatDate } from '@/utils/formatDate'
import { formatNumber } from '@/utils/formatNumber'

interface AlertCardProps {
  item: InboxItem
  athletePath: string
  isPending: boolean
  onDecide: (status: ReviewDecision['status']) => void
  compact?: boolean
}

const LEVEL_BORDER = {
  alto: 'border-l-risk-high',
  medio: 'border-l-risk-medium',
  bajo: 'border-l-risk-low',
} as const

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function AlertCard({ item, athletePath, isPending, onDecide, compact }: AlertCardProps) {
  const KindIcon = item.kind === 'fatigue' ? Activity : ShieldAlert
  const titleId = `alerta-${item.key}`

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-l-4 border-border bg-card p-4',
        LEVEL_BORDER[item.level],
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={titleId} className="truncate font-semibold">
            <Link to={athletePath} className="hover:underline">
              {item.athleteName}
            </Link>
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <KindIcon aria-hidden="true" className="size-4" />
            {INBOX_KIND_LABELS[item.kind]}
            {item.method && ` · ${RISK_ASSESSMENT_METHOD.labels[item.method]}`}
            {' · '}
            {formatDate(item.date)}
          </p>
        </div>
        <LevelBadge level={item.level} />
      </header>

      {!compact && (
        <>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="flex flex-col">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                ACWR
                <HelpHint term="acwr" />
              </dt>
              <dd className="font-semibold tabular-nums">
                {item.acwr !== null ? formatNumber(item.acwr, 2) : '—'}
              </dd>
            </div>
            {item.acuteLoad !== null && (
              <Metric label="Carga aguda" value={`${formatNumber(item.acuteLoad, 0)} UA`} />
            )}
            {item.chronicLoad !== null && (
              <Metric label="Carga crónica" value={`${formatNumber(item.chronicLoad, 0)} UA`} />
            )}
            {item.rpeAvg !== null && (
              <Metric label="RPE promedio" value={formatNumber(item.rpeAvg, 1)} />
            )}
          </dl>

          {item.rules.length > 0 && (
            <ul aria-label="Reglas que se activaron" className="flex flex-wrap gap-1.5">
              {item.rules.map((rule) => (
                <li key={rule}>
                  <StatusBadge
                    label={INJURY_RISK_RULE.labels[rule]}
                    tone={INJURY_RISK_RULE.tones[rule]}
                  />
                </li>
              ))}
            </ul>
          )}
          {item.details && (
            <p className="text-sm text-pretty text-muted-foreground">{item.details}</p>
          )}
        </>
      )}

      <footer className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => onDecide('reviewed')}
          disabled={isPending}
          aria-label={`Marcar como revisada la alerta de ${item.athleteName}`}
        >
          <CircleCheck aria-hidden="true" />
          Revisada
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecide('dismissed')}
          disabled={isPending}
          aria-label={`Descartar la alerta de ${item.athleteName}`}
        >
          <X aria-hidden="true" />
          Descartar
        </Button>
        <Button asChild size="sm" variant="ghost" className="ml-auto">
          <Link to={athletePath}>
            <UserRound aria-hidden="true" />
            Ver ficha
          </Link>
        </Button>
      </footer>
    </article>
  )
}
