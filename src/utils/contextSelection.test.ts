import { describe, expect, it } from 'vitest'
import type { Season } from '@/types/club'
import {
  CONTEXT_STORAGE_KEY,
  pickDefaultSeason,
  readStoredSelection,
  resolveSeason,
} from '@/utils/contextSelection'

const season = (id: number, start: string, status: Season['status']): Season => ({
  id_season: id,
  name: `T${id}`,
  start_date: start,
  status,
})

describe('selección de contexto', () => {
  it('usa por defecto la temporada activa más reciente', () => {
    const seasons = [
      season(1, '2024-02-01', 'active'),
      season(2, '2026-02-01', 'active'),
      season(3, '2027-02-01', 'planned'),
    ]
    expect(pickDefaultSeason(seasons)?.id_season).toBe(2)
  })

  it('usa la más reciente si no hay ninguna activa', () => {
    const seasons = [season(1, '2024-02-01', 'closed'), season(3, '2027-02-01', 'planned')]
    expect(pickDefaultSeason(seasons)?.id_season).toBe(3)
  })

  it('respeta la temporada elegida si existe y vuelve al defecto si no', () => {
    const seasons = [season(1, '2024-02-01', 'closed'), season(2, '2026-02-01', 'active')]
    expect(resolveSeason(seasons, 1)?.id_season).toBe(1)
    expect(resolveSeason(seasons, 99)?.id_season).toBe(2)
  })

  it('ignora una selección guardada con formato inválido', () => {
    window.localStorage.setItem(CONTEXT_STORAGE_KEY, '{"seasonId":"x"}')
    expect(readStoredSelection()).toEqual({ seasonId: null, categoryId: null })
  })
})
