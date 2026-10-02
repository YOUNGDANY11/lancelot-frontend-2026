export const API_ERROR_MESSAGES = {
  network:
    'No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.',
  unauthorized: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  forbidden: 'No tienes permiso para realizar esta acción.',
  notFound: 'No encontramos la información solicitada.',
  server: 'El servidor tuvo un problema. Inténtalo de nuevo en unos minutos.',
  unexpected: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
  validationPrefix: 'Revisa estos datos',
} as const

export const SESSION_MESSAGES = {
  expired: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  closedInOtherTab: 'Cerraste sesión en otra pestaña.',
  loggedOut: 'Cerraste sesión.',
  loggedOutEverywhere: 'Cerraste sesión en todos los dispositivos.',
} as const

export const FIELD_LABELS: Record<string, string> = {
  email: 'Correo',
  password: 'Contraseña',
  current_password: 'Contraseña actual',
  new_password: 'Nueva contraseña',
  name: 'Nombres',
  lastname: 'Apellidos',
  birth_date: 'Fecha de nacimiento',
  refresh_token: 'Sesión',
  id_role: 'Rol',
}

export const VALIDATION_RULE_TRANSLATIONS: Array<[RegExp, string]> = [
  [/should not exist/, 'no está permitido'],
  [/should not be empty/, 'es obligatorio'],
  [/must be an email/, 'debe ser un correo válido'],
  [/must be longer than or equal to/, 'es demasiado corto'],
  [/must be shorter than or equal to/, 'es demasiado largo'],
  [/must be a valid ISO 8601 date string|must be a Date instance/, 'debe ser una fecha válida'],
  [/must match .* regular expression|must be in the format/, 'no tiene el formato esperado'],
  [/must be an integer number|must be a number/, 'debe ser un número'],
  [/must be one of the following values/, 'tiene un valor no permitido'],
  [/must not be greater than/, 'supera el máximo permitido'],
  [/must not be less than/, 'está por debajo del mínimo permitido'],
  [/must be a boolean value/, 'debe ser sí o no'],
  [/must be a string/, 'debe ser un texto'],
]

export const BACKEND_MESSAGE_OVERRIDES: Record<string, string> = {
  'Este correo no esta asociado a ninguna cuenta': 'Este correo no está asociado a ninguna cuenta.',
  'Contraseña incorrecta': 'La contraseña no es correcta.',
  'Este correo ya esta asociado a un usuario': 'Este correo ya está asociado a otra cuenta.',
  'Este correo ya esta en uso por otro usuario': 'Este correo ya está en uso por otra cuenta.',
  'La contraseña actual no es correcta': 'La contraseña actual no es correcta.',
  'No tienes permisos para acceder': 'No tienes permiso para realizar esta acción.',
}
