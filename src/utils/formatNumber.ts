const LOCALE = 'es-CO'

export function formatNumber(value: number | null | undefined, maximumFractionDigits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value)
}

export function formatPercent(value: number | null | undefined, maximumFractionDigits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${formatNumber(value, maximumFractionDigits)} %`
}

export function formatLoad(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${formatNumber(value, 0)} UA`
}
