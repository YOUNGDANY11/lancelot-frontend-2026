import { CircleCheck, Sparkles, TriangleAlert, UserRound, X } from 'lucide-react'
import { Link } from 'react-router'
import { HelpHint } from '@/components/common/HelpHint'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  REVIEW_STATUS,
  TALENT_FLAG_SOURCE,
  TALENT_RULE,
  type ReviewStatus,
  type TalentRuleCode,
} from '@/constants/enums'
import type { TalentFlag } from '@/types/talent'
import { formatNumber } from '@/utils/formatNumber'

function ruleLabel(rule: string) {
  return rule in TALENT_RULE.labels ? TALENT_RULE.labels[rule as TalentRuleCode] : rule
}

interface TalentFlagCardProps {
  flag: TalentFlag
  athletePath: string
  isPending: boolean
  onDecide: (status: Exclude<ReviewStatus, 'open'>) => void
}

export function TalentFlagCard({ flag, athletePath, isPending, onDecide }: TalentFlagCardProps) {
  const athlete = flag.athlete_name || 'Deportista'
  const titleId = `talento-${flag.id_flag}`

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={titleId} className="truncate font-semibold">
            <Link to={athletePath} className="hover:underline">
              {athlete}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge
              label={TALENT_FLAG_SOURCE.labels[flag.source]}
              tone={TALENT_FLAG_SOURCE.tones[flag.source]}
            />
            <StatusBadge
              label={REVIEW_STATUS.labels[flag.status]}
              tone={REVIEW_STATUS.tones[flag.status]}
            />
          </div>
        </div>
        {flag.score !== null && flag.score !== undefined && (
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              Percentil
              <HelpHint term="percentile" />
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatNumber(flag.score, 0)}
            </span>
          </div>
        )}
      </header>

      {flag.triggered_rules && flag.triggered_rules.length > 0 && (
        <ul aria-label="Reglas que se cumplieron" className="flex flex-wrap gap-1.5">
          {flag.triggered_rules.map((rule) => (
            <li key={rule}>
              <StatusBadge label={ruleLabel(rule)} tone="info" />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">Criterios</p>
        <p className="text-pretty text-muted-foreground">{flag.criteria}</p>
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-sm">
        <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          <span className="font-medium">Acción recomendada: </span>
          {flag.recommended_action}
        </p>
      </div>
      {flag.warnings && flag.warnings.length > 0 && (
        <ul aria-label="Advertencias" className="flex flex-col gap-1 text-xs text-muted-foreground">
          {flag.warnings.map((warning) => (
            <li key={warning} className="flex items-start gap-1.5">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 size-3.5 shrink-0 text-risk-medium"
              />
              {warning}
            </li>
          ))}
        </ul>
      )}

      <footer className="flex flex-wrap items-center gap-2">
        {flag.status === 'open' && (
          <>
            <Button
              size="sm"
              onClick={() => onDecide('reviewed')}
              disabled={isPending}
              aria-label={`Marcar como revisada la señalización de ${athlete}`}
            >
              <CircleCheck aria-hidden="true" />
              Revisada
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecide('dismissed')}
              disabled={isPending}
              aria-label={`Descartar la señalización de ${athlete}`}
            >
              <X aria-hidden="true" />
              Descartar
            </Button>
          </>
        )}
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
