import { describe, expect, it } from 'vitest'
import { decodeAccessToken, resolveRoleCode } from '@/utils/role'

function fakeToken(payload: object): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.firma`
}

describe('roles', () => {
  it('usa el nombre del rol que devuelve el backend', () => {
    expect(resolveRoleCode('DIRECTOR_TECNICO', 2)).toBe('DIRECTOR_TECNICO')
  })

  it('recurre al id del rol cuando el nombre no es reconocido', () => {
    expect(resolveRoleCode('JUGADOR', 5)).toBe('ENCARGADO_SALUD')
    expect(resolveRoleCode(undefined, 99)).toBeNull()
  })

  it('lee el payload del access token', () => {
    const token = fakeToken({ id: 7, id_role: 3, email: 'ana@club.com' })
    expect(decodeAccessToken(token)).toMatchObject({ id: 7, id_role: 3 })
    expect(decodeAccessToken('no-es-un-jwt')).toBeNull()
  })
})
