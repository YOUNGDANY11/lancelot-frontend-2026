export const THEMES = ['dark', 'light'] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'dark'

export const THEME_STORAGE_KEY = 'lancelot-theme'

export const THEME_LABELS: Record<Theme, string> = {
  dark: 'Tema oscuro',
  light: 'Tema claro',
}
