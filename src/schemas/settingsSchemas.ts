import { z } from 'zod'
import { ALL_POSITIONS } from '@/constants/positions'
import { ROLE_CODES, type RoleCode } from '@/constants/roles'
import {
  birthDateField,
  emailField,
  integerField,
  passwordField,
  requiredChoice,
  textField,
} from '@/schemas/fields'
import type { CreateWeightProfileRequest } from '@/types/club'
import type { AdminCreateUserRequest } from '@/types/user'

const WEIGHT_TOTAL = 100

export function weightsTotal(values: {
  w_physical: string
  w_technical: string
  w_participation: string
}): number {
  return [values.w_physical, values.w_technical, values.w_participation].reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  )
}

export const weightProfileSchema = z
  .object({
    position: z.string().refine((value) => ALL_POSITIONS.includes(value), 'Elige la posición.'),
    age_category: requiredChoice('Elige la categoría.'),
    w_physical: integerField('el peso físico', 0, 100),
    w_technical: integerField('el peso técnico', 0, 100),
    w_participation: integerField('el peso de participación', 0, 100),
  })
  .refine((values) => weightsTotal(values) === WEIGHT_TOTAL, {
    message: 'Los tres pesos deben sumar 100 %.',
    path: ['w_participation'],
  })

export type WeightProfileFormValues = z.infer<typeof weightProfileSchema>

export function toCreateWeightProfileRequest(
  values: WeightProfileFormValues,
): CreateWeightProfileRequest {
  return {
    position: values.position,
    age_category: values.age_category,
    w_physical: Number(values.w_physical) / WEIGHT_TOTAL,
    w_technical: Number(values.w_technical) / WEIGHT_TOTAL,
    w_participation: Number(values.w_participation) / WEIGHT_TOTAL,
  }
}

export const userAccountSchema = z
  .object({
    name: textField('los nombres', 2, 100),
    lastname: textField('los apellidos', 2, 100),
    email: emailField,
    password: passwordField('Escribe una contraseña inicial.'),
    role: z.enum(ROLE_CODES, { error: 'Elige el rol de la cuenta.' }),
    birth_date: z.union([z.literal(''), birthDateField]),
  })
  .refine((values) => values.role !== 'DEPORTISTA' || values.birth_date !== '', {
    message: 'La fecha de nacimiento es obligatoria para los deportistas.',
    path: ['birth_date'],
  })

export type UserAccountFormValues = z.infer<typeof userAccountSchema>

export function toAdminCreateUserRequest(
  values: UserAccountFormValues,
  roleIds: Partial<Record<RoleCode, number>>,
): AdminCreateUserRequest | null {
  const idRole = roleIds[values.role]
  if (!idRole) return null
  return {
    name: values.name,
    lastname: values.lastname,
    email: values.email,
    password: values.password,
    id_role: idRole,
    ...(values.birth_date ? { birth_date: values.birth_date } : {}),
  }
}
