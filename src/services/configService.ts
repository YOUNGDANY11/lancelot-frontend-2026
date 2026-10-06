import { CONFIG_DEFINITIONS } from '@/constants/configFields'
import { apiClient } from '@/lib/apiClient'
import type { ApiMessage } from '@/types/api'
import type { ConfigKind, ConfigValues, ScopedConfig } from '@/types/config'

type RawConfig = Record<string, unknown>

function toScopedConfig(kind: ConfigKind, raw: RawConfig): ScopedConfig {
  const definition = CONFIG_DEFINITIONS[kind]
  const values: ConfigValues = {}
  for (const field of definition.fields) {
    const value = raw[field.key]
    values[field.key] = field.type === 'boolean' ? Boolean(value) : Number(value)
  }
  return {
    id: Number(raw[definition.idKey]),
    id_category:
      raw.id_category === null || raw.id_category === undefined ? null : Number(raw.id_category),
    scope: raw.scope === 'category' ? 'category' : 'global',
    values,
  }
}

function scopeParams(idCategory: number | null) {
  return idCategory ? { id_category: idCategory } : {}
}

export const configService = {
  async getActive(kind: ConfigKind, idCategory: number | null): Promise<ScopedConfig> {
    const definition = CONFIG_DEFINITIONS[kind]
    const { data } = await apiClient.http.get<Record<string, RawConfig>>(definition.endpoint, {
      params: scopeParams(idCategory),
    })
    return toScopedConfig(kind, data[definition.itemKey])
  },

  async listOverrides(kind: ConfigKind): Promise<ScopedConfig[]> {
    const definition = CONFIG_DEFINITIONS[kind]
    const { data } = await apiClient.http.get<Record<string, RawConfig[]>>(
      `${definition.endpoint}/categories`,
    )
    return (data[definition.listKey] ?? []).map((raw) => toScopedConfig(kind, raw))
  },

  async update(
    kind: ConfigKind,
    idCategory: number | null,
    values: ConfigValues,
  ): Promise<ApiMessage> {
    const { data } = await apiClient.http.put<ApiMessage>(
      CONFIG_DEFINITIONS[kind].endpoint,
      values,
      { params: scopeParams(idCategory) },
    )
    return data
  },

  async reset(kind: ConfigKind, idCategory: number): Promise<ApiMessage> {
    const { data } = await apiClient.http.delete<ApiMessage>(CONFIG_DEFINITIONS[kind].endpoint, {
      params: { id_category: idCategory },
    })
    return data
  },
}
