import { z } from 'zod'
import { birthDateField, emailField, passwordField, personNameField } from '@/schemas/fields'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export const loginSchema = z.object({
  email: emailField,
  password: passwordField(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: personNameField('nombres'),
    lastname: personNameField('apellidos'),
    email: emailField,
    password: passwordField('Crea una contraseña.'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña.'),
    birth_date: birthDateField,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export function toLoginRequest(values: LoginFormValues): LoginRequest {
  return { email: values.email, password: values.password }
}

export function toRegisterRequest(values: RegisterFormValues): RegisterRequest {
  return {
    name: values.name,
    lastname: values.lastname,
    email: values.email,
    password: values.password,
    birth_date: values.birth_date,
  }
}
