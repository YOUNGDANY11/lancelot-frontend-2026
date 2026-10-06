import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { ML_ENGINE_MODE, type MlEngineMode } from '@/constants/enums'
import { ENGINE_MODE_DESCRIPTIONS } from '@/constants/ml'
import { queryKeys } from '@/lib/queryKeys'
import { mlService } from '@/services/mlService'
import type { EngineConfig, UpdateEngineConfigRequest } from '@/types/ml'
import { parseApiError } from '@/utils/parseApiError'

function parseProbability(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (!/^\d(\.\d{1,3})?$/.test(normalized)) return null
  const value = Number(normalized)
  return value >= 0 && value <= 1 ? value : null
}

export function useEngineDraft(
  config: EngineConfig,
  onSave: (payload: UpdateEngineConfigRequest) => void,
) {
  const [mode, setMode] = useState<MlEngineMode>(config.engine)
  const [medium, setMedium] = useState(String(config.prob_medium_threshold))
  const [high, setHigh] = useState(String(config.prob_high_threshold))
  const [submitted, setSubmitted] = useState(false)

  const mediumValue = parseProbability(medium)
  const highValue = parseProbability(high)
  const thresholdError =
    mediumValue === null || highValue === null
      ? 'Escribe probabilidades entre 0 y 1, con máximo 3 decimales.'
      : mediumValue >= highValue
        ? 'El umbral de riesgo medio debe ser menor que el de riesgo alto.'
        : undefined

  const payload: UpdateEngineConfigRequest = {
    ...(mode !== config.engine ? { engine: mode } : {}),
    ...(mediumValue !== null && mediumValue !== config.prob_medium_threshold
      ? { prob_medium_threshold: mediumValue }
      : {}),
    ...(highValue !== null && highValue !== config.prob_high_threshold
      ? { prob_high_threshold: highValue }
      : {}),
  }
  const isDirty = Object.keys(payload).length > 0

  return {
    mode,
    setMode,
    medium,
    setMedium,
    high,
    setHigh,
    thresholdError: submitted ? thresholdError : undefined,
    isDirty,
    discard: () => {
      setMode(config.engine)
      setMedium(String(config.prob_medium_threshold))
      setHigh(String(config.prob_high_threshold))
      setSubmitted(false)
    },
    submit: () => {
      setSubmitted(true)
      if (thresholdError || !isDirty) return
      onSave(payload)
    },
  }
}

export function useEngineTabController() {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string>()

  const configQuery = useQuery({ queryKey: queryKeys.ml.engine(), queryFn: mlService.engineConfig })
  const readinessQuery = useQuery({
    queryKey: queryKeys.ml.readiness(),
    queryFn: mlService.readiness,
  })

  const mutation = useMutation({
    mutationFn: (payload: UpdateEngineConfigRequest) => mlService.updateEngine(payload),
    onSuccess: async (config) => {
      setServerError(undefined)
      await queryClient.invalidateQueries({ queryKey: queryKeys.ml.all })
      toast.success(`Motor guardado en modo ${ML_ENGINE_MODE.labels[config.engine].toLowerCase()}.`)
    },
    onError: (error) => setServerError(parseApiError(error)),
  })

  return {
    config: configQuery.data,
    formKey: `engine-${configQuery.dataUpdatedAt}`,
    isLoading: configQuery.isPending,
    errorMessage: configQuery.isError ? parseApiError(configQuery.error) : undefined,
    retry: () => void configQuery.refetch(),
    isReady: readinessQuery.data?.ready ?? false,
    modes: ML_ENGINE_MODE.options.map((option) => ({
      value: option.value,
      label: option.label,
      description: ENGINE_MODE_DESCRIPTIONS[option.value],
    })),
    save: (payload: UpdateEngineConfigRequest) => mutation.mutate(payload),
    isSaving: mutation.isPending,
    serverError,
  }
}
