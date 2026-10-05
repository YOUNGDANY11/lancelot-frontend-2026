import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { getApiErrorStatus, parseApiError } from '@/utils/parseApiError'

export interface FieldErrorMatcher<T extends FieldValues> {
  field: Path<T>
  pattern: RegExp
}

export const ROOT_SERVER_ERROR = 'root.server' as const

export function applyServerError<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
  matchers: FieldErrorMatcher<T>[] = [],
): string {
  const message = parseApiError(error)
  const match =
    getApiErrorStatus(error) === 400
      ? matchers.find((matcher) => matcher.pattern.test(message))
      : undefined
  if (match) {
    form.setError(match.field, { message }, { shouldFocus: true })
  } else {
    form.setError(ROOT_SERVER_ERROR, { message })
  }
  return message
}

export function serverErrorOf<T extends FieldValues>(form: UseFormReturn<T>): string | undefined {
  return form.formState.errors.root?.server?.message
}
