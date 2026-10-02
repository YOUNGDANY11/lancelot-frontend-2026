export const LOGIN_TEXTS = {
  title: 'Iniciar sesión',
  description: 'Ingresa con el correo y la contraseña de tu cuenta.',
  emailLabel: 'Correo',
  emailPlaceholder: 'nombre@club.com',
  passwordLabel: 'Contraseña',
  submit: 'Iniciar sesión',
  submitting: 'Ingresando…',
  noAccount: '¿Aún no tienes cuenta?',
  goToRegister: 'Crear cuenta',
  welcome: (name: string) => `Hola, ${name}. Qué bueno verte.`,
} as const

export const REGISTER_TEXTS = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta de deportista para reportar tu esfuerzo y seguir tu evolución.',
  staffHint: '¿Eres parte del cuerpo técnico? El administrador del club crea tu cuenta con tu rol.',
  nameLabel: 'Nombres',
  lastnameLabel: 'Apellidos',
  emailLabel: 'Correo',
  passwordLabel: 'Contraseña',
  passwordHint: 'Mínimo 6 caracteres.',
  confirmPasswordLabel: 'Confirmar contraseña',
  birthDateLabel: 'Fecha de nacimiento',
  minorNoticeTitle: 'Eres menor de edad',
  minorNotice:
    'Para tratar tus datos, el club debe registrar el consentimiento de tu acudiente (Ley 1581 de 2012). Avísale a tu entrenador para completarlo.',
  submit: 'Crear cuenta',
  submitting: 'Creando cuenta…',
  hasAccount: '¿Ya tienes cuenta?',
  goToLogin: 'Iniciar sesión',
  success: 'Tu cuenta quedó creada. Ahora inicia sesión.',
} as const

export const PROFILE_TEXTS = {
  title: 'Mi perfil',
  description: 'Actualiza tus datos personales, tu contraseña y tus sesiones abiertas.',
  personalTitle: 'Datos personales',
  personalDescription: 'Así te verá el cuerpo técnico en Lancelot.',
  birthDateHint: 'Si la dejas vacía, se conserva la fecha registrada.',
  save: 'Guardar',
  saving: 'Guardando…',
  saved: 'Tus datos quedaron guardados.',
  passwordTitle: 'Cambiar contraseña',
  passwordDescription: 'Por seguridad, primero confirma tu contraseña actual.',
  currentPasswordLabel: 'Contraseña actual',
  newPasswordLabel: 'Nueva contraseña',
  confirmPasswordLabel: 'Confirmar nueva contraseña',
  passwordSave: 'Cambiar contraseña',
  passwordSaving: 'Cambiando…',
  passwordSaved: 'Tu contraseña quedó actualizada.',
  sessionsTitle: 'Sesiones',
  sessionsDescription:
    'Si usaste Lancelot en un equipo prestado o perdiste tu celular, cierra la sesión en todos los dispositivos.',
  logoutAll: 'Cerrar sesión en todos los dispositivos',
  logoutAllConfirmTitle: '¿Cerrar sesión en todos los dispositivos?',
  logoutAllConfirmDescription:
    'Se cerrarán todas tus sesiones abiertas, incluida esta. Tendrás que volver a iniciar sesión.',
  logoutAllConfirm: 'Cerrar todas las sesiones',
  roleLabel: 'Rol',
} as const

export const USER_MENU_TEXTS = {
  trigger: 'Abrir menú de usuario',
  profile: 'Mi perfil',
  logout: 'Cerrar sesión',
} as const
