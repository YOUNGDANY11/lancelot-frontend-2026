import { addDays, parseISO, startOfWeek } from 'date-fns'
import type { AcwrSeriesPoint } from '@/types/athlete'
import { toApiDate } from '@/utils/formatDate'

export const HEATMAP_WEEKS = 8
export const HEATMAP_STEPS = 4

export interface HeatmapCell {
  date: string
  load: number
  step: number
}

export function buildHeatmapWeeks(
  series: AcwrSeriesPoint[],
  weeks = HEATMAP_WEEKS,
): HeatmapCell[][] {
  if (series.length === 0) return []
  const loadByDate = new Map(series.map((point) => [point.date, point.daily_load]))
  const lastDate = parseISO(series[series.length - 1].date)
  const firstMonday = addDays(startOfWeek(lastDate, { weekStartsOn: 1 }), -(weeks - 1) * 7)
  const max = Math.max(...series.map((point) => point.daily_load), 0)

  return Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = toApiDate(addDays(firstMonday, weekIndex * 7 + dayIndex))
      const load = loadByDate.get(date) ?? 0
      const step = load <= 0 || max <= 0 ? 0 : Math.max(1, Math.ceil((load / max) * HEATMAP_STEPS))
      return { date, load, step }
    }),
  )
}
