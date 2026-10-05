export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toNumberOr(value: unknown, fallback: number): number {
  return toNumber(value) ?? fallback
}
