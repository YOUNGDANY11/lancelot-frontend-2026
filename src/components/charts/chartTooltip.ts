export interface TooltipRenderProps<T> {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: T }>
}

export function tooltipDatum<T>(props: TooltipRenderProps<T>): T | null {
  if (!props.active || !props.payload?.length) return null
  return props.payload[0]?.payload ?? null
}
