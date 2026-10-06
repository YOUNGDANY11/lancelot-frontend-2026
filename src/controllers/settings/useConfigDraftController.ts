import { useState } from 'react'
import type { ConfigDefinition } from '@/constants/configFields'
import type { ConfigValues } from '@/types/config'
import { changedValues, parseConfigDraft, toDraft, type ConfigDraft } from '@/utils/configForm'

export function useConfigDraftController({
  definition,
  values,
  forceSave,
  onSave,
}: {
  definition: ConfigDefinition
  values: ConfigValues
  forceSave: boolean
  onSave: (values: ConfigValues) => void
}) {
  const [draft, setDraft] = useState<ConfigDraft>(() => toDraft(definition, values))
  const [submitted, setSubmitted] = useState(false)
  const parsed = parseConfigDraft(definition, draft)
  const changes = parsed.isValid ? changedValues(values, parsed.values) : {}
  const isDirty = Object.keys(changes).length > 0

  return {
    draft,
    setField: (key: string, value: string | boolean) =>
      setDraft((current) => ({ ...current, [key]: value })),
    fieldErrors: submitted ? parsed.fieldErrors : {},
    ruleErrors: submitted ? parsed.ruleErrors : [],
    isDirty,
    canSubmit: forceSave || isDirty,
    discard: () => {
      setDraft(toDraft(definition, values))
      setSubmitted(false)
    },
    submit: () => {
      setSubmitted(true)
      if (!parsed.isValid) return
      onSave(forceSave ? parsed.values : changes)
    },
  }
}
