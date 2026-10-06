import type { ValidationKpi } from '@/controllers/analytics/useValidationTabController'
import { formatPercent } from '@/utils/formatNumber'

export function ValidationKpis({ kpis }: { kpis: ValidationKpi[] }) {
  return (
    <ul aria-label="Indicadores de validación" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {kpis.map((kpi) => (
        <li key={kpi.key} className="flex flex-col gap-2 rounded-2xl glass-subtle p-4">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          {kpi.value === null ? (
            <p className="text-lg font-semibold text-muted-foreground">Sin datos suficientes</p>
          ) : (
            <p className="text-kpi">{formatPercent(kpi.value, 1)}</p>
          )}
          <p className="text-xs text-muted-foreground">{kpi.detail}</p>
          {kpi.definition && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">
                Cómo se calcula
              </summary>
              <p className="mt-1 text-pretty">{kpi.definition}</p>
            </details>
          )}
        </li>
      ))}
    </ul>
  )
}
