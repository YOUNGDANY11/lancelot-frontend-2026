export const RPE_MIN = 0
export const RPE_MAX = 10

export const RPE_SCALE: { value: number; label: string }[] = [
  { value: 0, label: 'Reposo' },
  { value: 1, label: 'Muy, muy fácil' },
  { value: 2, label: 'Fácil' },
  { value: 3, label: 'Moderado' },
  { value: 4, label: 'Algo duro' },
  { value: 5, label: 'Duro' },
  { value: 6, label: 'Duro +' },
  { value: 7, label: 'Muy duro' },
  { value: 8, label: 'Muy duro +' },
  { value: 9, label: 'Muy, muy duro' },
  { value: 10, label: 'Máximo' },
]

export function rpeLabel(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'Sin registrar'
  return RPE_SCALE.find((step) => step.value === value)?.label ?? String(value)
}

export function rpeHue(value: number): number {
  const greenHue = 145
  const redHue = 25
  return greenHue - ((greenHue - redHue) * value) / RPE_MAX
}

export function sessionLoad(rpe: number | null, minutes: number | null): number | null {
  if (rpe === null || minutes === null) return null
  return rpe * minutes
}

export function describeSessionLoad(rpe: number | null, minutes: number | null): string {
  const load = sessionLoad(rpe, minutes)
  if (load === null || rpe === null || minutes === null) return 'Elige el RPE y los minutos'
  return `RPE ${rpe} × ${minutes} min = ${load} UA`
}
