import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { CONFIG_DEFINITIONS } from '@/constants/configFields'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { configService } from '@/services/configService'
import type { ConfigKind, ConfigValues } from '@/types/config'
import { parseApiError } from '@/utils/parseApiError'

const GLOBAL = 'global'

export function useScopedConfigController(kind: ConfigKind) {
  const definition = CONFIG_DEFINITIONS[kind]
  const { categories } = useAppContext()
  const queryClient = useQueryClient()
  const [idCategory, setIdCategory] = useState<number | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const activeQuery = useQuery({
    queryKey: queryKeys.config.active(kind, idCategory),
    queryFn: () => configService.getActive(kind, idCategory),
  })
  const overridesQuery = useQuery({
    queryKey: queryKeys.config.overrides(kind),
    queryFn: () => configService.listOverrides(kind),
  })

  const nameOf = (id: number | null) =>
    id === null
      ? 'la configuración global'
      : (categories.find((item) => item.id_category === id)?.name ?? `la categoría ${id}`)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all(kind) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.athlete.root }),
      queryClient.invalidateQueries({ queryKey: queryKeys.training.all }),
    ])

  const saveMutation = useMutation({
    mutationFn: (values: ConfigValues) => configService.update(kind, idCategory, values),
    onSuccess: async () => {
      await refresh()
      toast.success(
        idCategory === null
          ? `${definition.title}: configuración global guardada.`
          : `${definition.title}: ${nameOf(idCategory)} ahora usa su propia configuración.`,
      )
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const resetMutation = useMutation({
    mutationFn: (id: number) => configService.reset(kind, id),
    onSuccess: async (_data, id) => {
      await refresh()
      setConfirmingReset(false)
      toast.success(`${nameOf(id)} vuelve a usar la configuración global.`)
    },
    onError: (error) => toast.error(parseApiError(error)),
  })

  const overrideIds = new Set((overridesQuery.data ?? []).map((item) => item.id_category))
  const config = activeQuery.data

  return {
    definition,
    scopeValue: idCategory === null ? GLOBAL : String(idCategory),
    scopeOptions: [
      { value: GLOBAL, label: 'Global (todas las categorías)' },
      ...categories.map((item) => ({
        value: String(item.id_category),
        label: overrideIds.has(item.id_category) ? `${item.name} · propia` : item.name,
      })),
    ],
    onScopeChange: (value: string) => setIdCategory(value === GLOBAL ? null : Number(value)),
    isGlobal: idCategory === null,
    scopeName: nameOf(idCategory),
    overrides: (overridesQuery.data ?? []).map((item) => ({
      id_category: item.id_category,
      name: nameOf(item.id_category),
    })),
    selectOverride: (id: number | null) => setIdCategory(id),
    config,
    formKey: `${kind}-${idCategory ?? GLOBAL}-${activeQuery.dataUpdatedAt}`,
    isLoading: activeQuery.isPending,
    errorMessage: activeQuery.isError ? parseApiError(activeQuery.error) : undefined,
    retry: () => void activeQuery.refetch(),
    usesGlobal: idCategory !== null && config?.scope === 'global',
    save: (values: ConfigValues) => saveMutation.mutate(values),
    isSaving: saveMutation.isPending,
    confirmingReset,
    askReset: () => setConfirmingReset(true),
    cancelReset: () => setConfirmingReset(false),
    reset: () => idCategory !== null && resetMutation.mutate(idCategory),
    isResetting: resetMutation.isPending,
  }
}
