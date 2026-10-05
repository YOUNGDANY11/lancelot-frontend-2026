import { vi } from 'vitest'
import { alertsService } from '@/services/alertsService'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import { categoriesService } from '@/services/categoriesService'
import { parentalConsentsService } from '@/services/parentalConsentsService'
import { seasonsService } from '@/services/seasonsService'
import { usersService } from '@/services/usersService'
import { weightProfilesService } from '@/services/weightProfilesService'
import type { Category, Season } from '@/types/club'

export const ACTIVE_SEASON: Season = {
  id_season: 2,
  name: 'Temporada 2026',
  start_date: '2026-02-01',
  end_date: null,
  status: 'active',
}

export const SUB15: Category = { id_category: 4, name: 'Sub-15', min_age: 13, max_age: 15 }

export function primeAppDataMocks(overrides: { seasons?: Season[]; categories?: Category[] } = {}) {
  vi.mocked(seasonsService.listAll).mockResolvedValue(overrides.seasons ?? [ACTIVE_SEASON])
  vi.mocked(categoriesService.listAll).mockResolvedValue(overrides.categories ?? [SUB15])
  vi.mocked(athleteAssignmentsService.getMine).mockResolvedValue([])
  vi.mocked(athleteAssignmentsService.listAll).mockResolvedValue([])
  vi.mocked(alertsService.countOpen).mockResolvedValue({ fatigue: 0, risk: 0, total: 0 })
  vi.mocked(weightProfilesService.count).mockResolvedValue(0)
  vi.mocked(parentalConsentsService.listAll).mockResolvedValue([])
  vi.mocked(usersService.listAll).mockResolvedValue([])
  vi.mocked(usersService.listAllAthletes).mockResolvedValue([])
}
