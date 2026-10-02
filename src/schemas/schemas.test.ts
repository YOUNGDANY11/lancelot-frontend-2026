import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, toRegisterRequest } from '@/schemas/authSchemas'
import {
  changePasswordSchema,
  profileSchema,
  toUpdateMyProfileRequest,
} from '@/schemas/profileSchemas'

function firstIssue(result: {
  success: boolean
  error?: { issues: { message: string; path: PropertyKey[] }[] }
}) {
  return result.error?.issues[0]
}

const VALID_REGISTER = {
  name: 'Ana',
  lastname: 'Pérez',
  email: 'ana.perez@club.com',
  password: 'secreta1',
  confirmPassword: 'secreta1',
  birth_date: '2011-04-12',
}

describe('loginSchema', () => {
  it('exige un correo válido con mensajes en español', () => {
    const result = loginSchema.safeParse({ email: 'ana', password: 'secreta1' })
    expect(firstIssue(result)?.message).toBe(
      'Escribe un correo válido, por ejemplo nombre@club.com.',
    )
  })

  it('exige al menos 8 caracteres en el correo', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'secreta1' })
    expect(firstIssue(result)?.message).toBe('El correo debe tener al menos 8 caracteres.')
  })

  it('exige al menos 6 caracteres en la contraseña', () => {
    const result = loginSchema.safeParse({ email: 'ana@club.com', password: '123' })
    expect(firstIssue(result)?.message).toBe('La contraseña debe tener al menos 6 caracteres.')
  })
})

describe('registerSchema', () => {
  it('acepta un registro válido y no envía la confirmación', () => {
    const result = registerSchema.safeParse(VALID_REGISTER)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(toRegisterRequest(result.data)).toEqual({
        name: 'Ana',
        lastname: 'Pérez',
        email: 'ana.perez@club.com',
        password: 'secreta1',
        birth_date: '2011-04-12',
      })
    }
  })

  it('avisa cuando las contraseñas no coinciden', () => {
    const result = registerSchema.safeParse({ ...VALID_REGISTER, confirmPassword: 'otra123' })
    expect(firstIssue(result)).toMatchObject({
      message: 'Las contraseñas no coinciden.',
      path: ['confirmPassword'],
    })
  })

  it('rechaza fechas de nacimiento futuras o inexistentes', () => {
    expect(
      firstIssue(registerSchema.safeParse({ ...VALID_REGISTER, birth_date: '2999-01-01' }))
        ?.message,
    ).toBe('La fecha de nacimiento no puede ser futura.')
    expect(
      firstIssue(registerSchema.safeParse({ ...VALID_REGISTER, birth_date: '2011-02-30' }))
        ?.message,
    ).toBe('Esa fecha no existe. Revísala.')
  })
})

describe('perfil', () => {
  it('envía solo nombres, apellidos, correo y fecha de nacimiento', () => {
    const values = profileSchema.parse({
      name: 'Ana',
      lastname: 'Pérez',
      email: 'ana@club.com',
      birth_date: '2011-04-12',
    })
    expect(Object.keys(toUpdateMyProfileRequest(values)).sort()).toEqual([
      'birth_date',
      'email',
      'lastname',
      'name',
    ])
  })

  it('omite la fecha de nacimiento si queda vacía', () => {
    const values = profileSchema.parse({
      name: 'Ana',
      lastname: 'Pérez',
      email: 'ana@club.com',
      birth_date: '',
    })
    expect(toUpdateMyProfileRequest(values)).not.toHaveProperty('birth_date')
  })

  it('exige que la nueva contraseña sea distinta y esté confirmada', () => {
    const same = changePasswordSchema.safeParse({
      current_password: 'secreta1',
      new_password: 'secreta1',
      confirmPassword: 'secreta1',
    })
    expect(firstIssue(same)?.message).toBe('La nueva contraseña debe ser diferente de la actual.')
  })
})
