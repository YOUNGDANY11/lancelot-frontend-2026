import type { LoginResponse } from '@/types/auth'
import type { User } from '@/types/user'

export const ATHLETE_USER: User = {
  id_user: 7,
  id_role: 3,
  name: 'Ana María',
  lastname: 'Pérez',
  email: 'ana.perez@club.com',
  birth_date: '2011-04-12',
  role_name: 'DEPORTISTA',
  id_ath_cat: [],
}

export const COACH_USER: User = {
  id_user: 3,
  id_role: 2,
  name: 'Carlos',
  lastname: 'Rojas',
  email: 'carlos.rojas@club.com',
  birth_date: null,
  role_name: 'ENTRENADOR',
}

export const ADMIN_USER: User = {
  id_user: 1,
  id_role: 1,
  name: 'Laura',
  lastname: 'Gómez',
  email: 'laura.gomez@club.com',
  birth_date: null,
  role_name: 'ADMIN',
}

export const LOGIN_SUCCESS: LoginResponse = {
  status: 'Success',
  mensaje: 'Inicio de sesion exitoso',
  token: { access_token: 'access-token', refresh_token: 'refresh-token' },
}
