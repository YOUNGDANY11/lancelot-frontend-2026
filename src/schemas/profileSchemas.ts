import { z } from 'zod'
import { birthDateField, emailField, passwordField, personNameField } from '@/schemas/fields'
import type { ChangePasswordRequest, UpdateMyProfileRequest } from '@/types/user'

export const profileSchema = z.object({
  name: personNameField('nombres'),
  lastname: personNameField('apellidos'),
  email: emailField,
  birth_date: z.union([z.literal(''), birthDateField]),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export function toUpdateMyProfileRequest(values: ProfileFormValues): UpdateMyProfileRequest {
  const request: UpdateMyProfileRequest = {
    name: values.name,
    lastname: values.lastname,
    email: values.email,
  }
  if (values.birth_date) request.birth_date = values.birth_date
  return request
}

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Escribe tu contraseña actual.'),
    new_password: passwordField('Escribe la nueva contraseña.'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña.'),
  })
  .refine((values) => values.new_password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
  .refine((values) => values.new_password !== values.current_password, {
    message: 'La nueva contraseña debe ser diferente de la actual.',
    path: ['new_password'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export function toChangePasswordRequest(values: ChangePasswordFormValues): ChangePasswordRequest {
  return { current_password: values.current_password, new_password: values.new_password }
}
