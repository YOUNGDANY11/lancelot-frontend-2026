import type { SessionLoad } from '@/types/training'
import { fullName } from '@/utils/text'

export interface RosterMember {
  id_user: number
  name?: string | null
  lastname?: string | null
  position?: string | null
}

export interface RpeRow {
  id_user: number
  name: string
  position: string | null
  loadId: number | null
  rpe: number | null
  minutes: string
  absent: boolean
  savedRpe: number | null
  savedMinutes: number | null
}

export interface RpeOperation {
  kind: 'create' | 'update'
  id_user: number
  loadId: number | null
  rpe: number
  duration_min: number
}

export const MAX_SESSION_MINUTES = 300

export function buildRpeRows(
  roster: RosterMember[],
  loads: SessionLoad[],
  plannedMinutes: number,
): RpeRow[] {
  const loadByUser = new Map(loads.map((load) => [load.id_user, load]))
  return roster
    .map((member) => {
      const load = loadByUser.get(member.id_user)
      return {
        id_user: member.id_user,
        name: fullName(member) || `Deportista ${member.id_user}`,
        position: member.position ?? null,
        loadId: load?.id_load ?? null,
        rpe: load?.rpe ?? null,
        minutes: String(load?.duration_min ?? plannedMinutes),
        absent: false,
        savedRpe: load?.rpe ?? null,
        savedMinutes: load?.duration_min ?? null,
      }
    })
    .sort((first, second) => first.name.localeCompare(second.name))
}

export function parseMinutes(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null
  const minutes = Number(value)
  return minutes >= 1 && minutes <= MAX_SESSION_MINUTES ? minutes : null
}

export function isRowDirty(row: RpeRow): boolean {
  if (row.absent || row.rpe === null) return false
  return row.rpe !== row.savedRpe || parseMinutes(row.minutes) !== row.savedMinutes
}

export function planRpeOperations(rows: RpeRow[]): {
  operations: RpeOperation[]
  invalidUsers: number[]
} {
  const operations: RpeOperation[] = []
  const invalidUsers: number[] = []
  for (const row of rows) {
    if (!isRowDirty(row) || row.rpe === null) continue
    const minutes = parseMinutes(row.minutes)
    if (minutes === null) {
      invalidUsers.push(row.id_user)
      continue
    }
    operations.push({
      kind: row.loadId === null ? 'create' : 'update',
      id_user: row.id_user,
      loadId: row.loadId,
      rpe: row.rpe,
      duration_min: minutes,
    })
  }
  return { operations, invalidUsers }
}

export function summarizeRows(rows: RpeRow[]) {
  const present = rows.filter((row) => !row.absent)
  return {
    total: rows.length,
    present: present.length,
    withRpe: present.filter((row) => row.rpe !== null).length,
    pending: present.filter((row) => row.rpe === null).length,
    dirty: rows.filter(isRowDirty).length,
  }
}
