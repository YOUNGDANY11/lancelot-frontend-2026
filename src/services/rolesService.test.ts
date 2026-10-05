import { describe, expect, it } from 'vitest'
import { mapRoleIdsByCode } from '@/services/rolesService'

describe('mapRoleIdsByCode', () => {
  it('asigna el id de cada rol según su código', () => {
    expect(
      mapRoleIdsByCode([
        { id_role: 1, name: 'ADMIN', code: 'ADMIN' },
        { id_role: 2, name: 'ENTRENADOR', code: 'ENTRENADOR' },
        { id_role: 3, name: 'DEPORTISTA', code: 'DEPORTISTA' },
        { id_role: 4, name: 'DIRECTOR_TECNICO', code: 'DIRECTOR_TECNICO' },
        { id_role: 5, name: 'ENCARGADO_SALUD', code: 'ENCARGADO_SALUD' },
      ]),
    ).toEqual({
      ADMIN: 1,
      ENTRENADOR: 2,
      DEPORTISTA: 3,
      DIRECTOR_TECNICO: 4,
      ENCARGADO_SALUD: 5,
    })
  })

  it('reconoce el rol por su nombre cuando el código no es el esperado', () => {
    expect(mapRoleIdsByCode([{ id_role: 3, name: 'DEPORTISTA', code: 'DEP' }])).toEqual({
      DEPORTISTA: 3,
    })
  })

  it('ignora roles que no pertenecen a la plataforma', () => {
    expect(mapRoleIdsByCode([{ id_role: 9, name: 'Invitado', code: 'INV' }])).toEqual({})
  })
})
