export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function toNumberOr(value: unknown, fallback: number): number {
  return toNumber(value) ?? fallback
}

export function withNumbers<T extends object>(item: T, keys: (keyof T)[]): T {
  const copy = { ...item }
  for (const key of keys) {
    const value = copy[key]
    if (value !== null && value !== undefined) {
      copy[key] = toNumber(value) as T[keyof T]
    }
  }
  return copy
}
