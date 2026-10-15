import type { Sport } from '@/constants/enums'
import type { SeasonComparisonPoint, SeasonSummary, SportSummary } from '@/types/athlete'

export function sportViewsOf(summary: SeasonSummary): SportSummary[] {
  if (summary.by_sport && summary.by_sport.length > 0) return summary.by_sport
  return [
    {
      sport: summary.athlete.sport ?? 'futbol',
      category: summary.athlete.category,
      position: summary.athlete.position,
      training_participation: summary.training_participation,
      match_participation: summary.match_participation,
      weighted_progress_index: summary.weighted_progress_index,
    },
  ]
}

export function comparisonBySport(
  points: SeasonComparisonPoint[],
): { sport: Sport | null; points: SeasonComparisonPoint[] }[] {
  const sports = [...new Set(points.map((point) => point.sport ?? null))]
  if (sports.length <= 1) return [{ sport: sports[0] ?? null, points }]
  return sports.map((sport) => ({
    sport,
    points: points.filter((point) => (point.sport ?? null) === sport),
  }))
}
