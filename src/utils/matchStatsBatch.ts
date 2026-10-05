import type { MatchStatistic, MatchStatisticRequest } from '@/types/training'
import type { RosterMember } from '@/utils/rpeBatch'
import { fullName } from '@/utils/text'

export const MAX_MATCH_MINUTES = 130

export interface MatchStatRow {
  id_user: number
  name: string
  statId: number | null
  played: boolean
  minutes: string
  goals: string
  assists: string
  yellow: string
  red: string
  rpe: number | null
  saved: MatchStatistic | null
}

export type MatchCounterField = 'goals' | 'assists' | 'yellow' | 'red'

export const COUNTER_LIMITS: Record<MatchCounterField, number> = {
  goals: 20,
  assists: 20,
  yellow: 2,
  red: 1,
}

export function buildMatchStatRows(
  roster: RosterMember[],
  stats: MatchStatistic[],
): MatchStatRow[] {
  const statByUser = new Map(stats.map((stat) => [stat.id_user, stat]))
  return roster
    .map((member) => {
      const stat = statByUser.get(member.id_user) ?? null
      return {
        id_user: member.id_user,
        name: fullName(member) || `Deportista ${member.id_user}`,
        statId: stat?.id_match_stat ?? null,
        played: stat !== null,
        minutes: stat ? String(stat.minutes_played) : '',
        goals: String(stat?.goals ?? 0),
        assists: String(stat?.assists ?? 0),
        yellow: String(stat?.yellow_cards ?? 0),
        red: String(stat?.red_cards ?? 0),
        rpe: stat?.rpe ?? null,
        saved: stat,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name))
}

function parseCount(value: string, max: number): number | null {
  if (!/^\d+$/.test(value.trim())) return null
  const parsed = Number(value)
  return parsed <= max ? parsed : null
}

export function toMatchStatPayload(
  row: MatchStatRow,
  idMatch: number,
): { payload: MatchStatisticRequest | null; error: string | null } {
  const minutes = parseCount(row.minutes, MAX_MATCH_MINUTES)
  if (minutes === null) return { payload: null, error: `Minutos entre 0 y ${MAX_MATCH_MINUTES}.` }
  const counters = {
    goals: parseCount(row.goals, COUNTER_LIMITS.goals),
    assists: parseCount(row.assists, COUNTER_LIMITS.assists),
    yellow_cards: parseCount(row.yellow, COUNTER_LIMITS.yellow),
    red_cards: parseCount(row.red, COUNTER_LIMITS.red),
  }
  if (Object.values(counters).some((value) => value === null)) {
    return { payload: null, error: 'Revisa goles, asistencias y tarjetas.' }
  }
  return {
    payload: {
      id_match: idMatch,
      id_user: row.id_user,
      minutes_played: minutes,
      goals: counters.goals ?? 0,
      assists: counters.assists ?? 0,
      yellow_cards: counters.yellow_cards ?? 0,
      red_cards: counters.red_cards ?? 0,
      ...(row.rpe !== null ? { rpe: row.rpe } : {}),
    },
    error: null,
  }
}

export function isStatRowDirty(row: MatchStatRow, idMatch: number): boolean {
  if (!row.played) return false
  const { payload } = toMatchStatPayload(row, idMatch)
  if (!payload) return true
  const saved = row.saved
  if (!saved) return true
  return (
    payload.minutes_played !== saved.minutes_played ||
    payload.goals !== saved.goals ||
    payload.assists !== saved.assists ||
    payload.yellow_cards !== saved.yellow_cards ||
    payload.red_cards !== saved.red_cards ||
    (payload.rpe ?? null) !== (saved.rpe ?? null)
  )
}
