import { describe, expect, it } from 'vitest'
import type { Season } from '@/types/club'
import type { User } from '@/types/user'
import { buildSetupSteps, summarizeSetup, type SetupSnapshot } from '@/utils/setupChecklist'

const ACTIVE: Season = { id_season: 1, name: '2026', start_date: '2026-02-01', status: 'active' }
const PLANNED: Season = { id_season: 2, name: '2027', start_date: '2027-02-01', status: 'planned' }

function athlete(id: number, birthDate: string): User {
  return {
    id_user: id,
    id_role: 3,
    name: `Deportista ${id}`,
    lastname: 'Prueba',
    email: `d${id}@club.com`,
    birth_date: birthDate,
    role_name: 'DEPORTISTA',
  }
}

function snapshot(overrides: Partial<SetupSnapshot> = {}): SetupSnapshot {
  return {
    role: 'ADMIN',
    currentUserId: 1,
    seasons: [],
    activeSeason: null,
    categories: [],
    weightProfileCount: 0,
    users: [],
    athletes: [],
    assignments: [],
    grantedConsents: [],
    ...overrides,
  }
}

function stepOf(steps: ReturnType<typeof buildSetupSteps>, key: string) {
  const step = steps.find((item) => item.key === key)
  if (!step) throw new Error(`No existe el paso ${key}`)
  return step
}

describe('buildSetupSteps', () => {
  it('pide crear la temporada cuando el club empieza de cero', () => {
    const steps = buildSetupSteps(snapshot())
    expect(stepOf(steps, 'season')).toMatchObject({ status: 'pending', action: 'createSeason' })
    expect(stepOf(steps, 'weightProfiles').status).toBe('blocked')
    expect(stepOf(steps, 'assignments').status).toBe('blocked')
    expect(stepOf(steps, 'consents').status).toBe('blocked')
    expect(summarizeSetup(steps)).toMatchObject({ done: 0, total: 6 })
  })

  it('ofrece activar una temporada planeada en vez de crear otra', () => {
    const steps = buildSetupSteps(snapshot({ seasons: [PLANNED] }))
    expect(stepOf(steps, 'season')).toMatchObject({ status: 'pending', action: 'activateSeason' })
  })

  it('cuenta los deportistas asignados en la temporada activa', () => {
    const steps = buildSetupSteps(
      snapshot({
        seasons: [ACTIVE],
        activeSeason: ACTIVE,
        categories: [{ id_category: 1, name: 'Sub-15' }],
        athletes: [athlete(10, '2011-01-01'), athlete(11, '2011-05-05')],
        assignments: [{ id_ath_cat: 1, id_user: 10 }],
      }),
    )
    expect(stepOf(steps, 'assignments')).toMatchObject({
      status: 'pending',
      detail: '1 de 2 deportistas asignados en 2026.',
    })
  })

  it('marca los consentimientos completos solo cuando todos los menores lo tienen', () => {
    const minors = [athlete(10, '2014-01-01'), athlete(11, '2013-03-03')]
    const pending = buildSetupSteps(
      snapshot({
        athletes: minors,
        grantedConsents: [
          {
            id_consent: 1,
            id_user: 10,
            guardian_name: 'Acudiente',
            guardian_document: '123',
            guardian_relationship: 'Madre',
            signed_at: '2026-02-01',
            status: 'granted',
          },
        ],
      }),
    )
    expect(stepOf(pending, 'consents')).toMatchObject({
      status: 'pending',
      detail: '1 de 2 menores con consentimiento otorgado.',
    })
  })

  it('deja a cargo de otro rol lo que el Director Técnico no puede verificar', () => {
    const steps = buildSetupSteps(
      snapshot({ role: 'DIRECTOR_TECNICO', users: null, grantedConsents: null }),
    )
    expect(stepOf(steps, 'staff').status).toBe('other-role')
    expect(stepOf(steps, 'consents').status).toBe('other-role')
    expect(summarizeSetup(steps).total).toBe(4)
  })

  it('considera completa la configuración cuando todos los pasos verificables están listos', () => {
    const steps = buildSetupSteps(
      snapshot({
        seasons: [ACTIVE],
        activeSeason: ACTIVE,
        categories: [{ id_category: 1, name: 'Sub-15' }],
        weightProfileCount: 3,
        users: [{ ...athlete(5, '1990-01-01'), role_name: 'ENTRENADOR', id_role: 2 }],
        athletes: [athlete(10, '2000-01-01')],
        assignments: [{ id_ath_cat: 1, id_user: 10 }],
      }),
    )
    expect(summarizeSetup(steps)).toEqual({ done: 6, total: 6, isComplete: true })
  })
})
