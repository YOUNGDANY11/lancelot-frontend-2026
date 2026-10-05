import { Bell, HeartPulse } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { APP_MODULES } from '@/constants/navigation'
import { useNotificationsController } from '@/controllers/useNotificationsController'

export function NotificationsBell() {
  const { canSeeAlerts, total, fatigue, risk, badgeLabel, triggerLabel, isError } =
    useNotificationsController()

  if (!canSeeAlerts) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={triggerLabel}>
          <Bell aria-hidden="true" />
          {total > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-risk-high px-1 text-[0.65rem] leading-5 font-bold text-white tabular-nums"
            >
              {badgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="font-heading font-semibold">Alertas pendientes</p>
        {isError ? (
          <p className="text-sm text-muted-foreground">No pudimos consultar las alertas.</p>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alertas pendientes de revisión.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            <li className="flex justify-between">
              <span>Alertas de fatiga</span>
              <span className="font-semibold tabular-nums">{fatigue}</span>
            </li>
            <li className="flex justify-between">
              <span>Evaluaciones de riesgo</span>
              <span className="font-semibold tabular-nums">{risk}</span>
            </li>
          </ul>
        )}
        <Button asChild size="sm" className="w-full">
          <Link to={`${APP_MODULES.health.path}?tab=alertas`}>
            <HeartPulse aria-hidden="true" />
            Ir a la bandeja de alertas
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
