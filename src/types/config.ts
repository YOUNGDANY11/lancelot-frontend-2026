export type ConfigScope = 'category' | 'global'

export type ConfigKind = 'acwr' | 'risk' | 'talent'

export type ConfigValues = Record<string, number | boolean>

export interface ScopedConfig {
  id: number
  id_category: number | null
  scope: ConfigScope
  values: ConfigValues
}
