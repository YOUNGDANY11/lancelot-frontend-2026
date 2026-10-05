import type { Season } from '@/types/club'

export const CONTEXT_STORAGE_KEY = 'lancelot-context'

export interface StoredContextSelection {
  seasonId: number | null
  categoryId: number | null
}

const EMPTY_SELECTION: StoredContextSelection = { seasonId: null, categoryId: null }

function byStartDateDesc(first: Season, second: Season): number {
  if (first.start_date === second.start_date) return second.id_season - first.id_season
  return first.start_date < second.start_date ? 1 : -1
}

export function findActiveSeason(seasons: Season[]): Season | null {
  return (
    [...seasons].filter((season) => season.status === 'active').sort(byStartDateDesc)[0] ?? null
  )
}

export function pickDefaultSeason(seasons: Season[]): Season | null {
  return findActiveSeason(seasons) ?? [...seasons].sort(byStartDateDesc)[0] ?? null
}

export function resolveSeason(seasons: Season[], seasonId: number | null): Season | null {
  return seasons.find((season) => season.id_season === seasonId) ?? pickDefaultSeason(seasons)
}

export function sortSeasons(seasons: Season[]): Season[] {
  return [...seasons].sort(byStartDateDesc)
}

function isStoredSelection(value: unknown): value is StoredContextSelection {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  const isIdOrNull = (field: unknown) => field === null || typeof field === 'number'
  return isIdOrNull(candidate.seasonId) && isIdOrNull(candidate.categoryId)
}

export function readStoredSelection(): StoredContextSelection {
  try {
    const raw = window.localStorage.getItem(CONTEXT_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isStoredSelection(parsed) ? parsed : EMPTY_SELECTION
  } catch {
    return EMPTY_SELECTION
  }
}

export function storeSelection(selection: StoredContextSelection): void {
  try {
    window.localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(selection))
  } catch {
    return
  }
}
