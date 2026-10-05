import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useForm, type DefaultValues, type FieldValues, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { applyServerError, serverErrorOf, type FieldErrorMatcher } from '@/utils/formErrors'

interface EntityFormOptions<TValues extends FieldValues> {
  schema: z.ZodType<TValues, TValues>
  defaultValues: DefaultValues<TValues>
  submit: (values: TValues) => Promise<unknown>
  invalidate: QueryKey[]
  successMessage: (values: TValues) => string
  onDone: () => void
  fieldMatchers?: FieldErrorMatcher<TValues>[]
}

export function useEntityFormController<TValues extends FieldValues>({
  schema,
  defaultValues,
  submit,
  invalidate,
  successMessage,
  onDone,
  fieldMatchers = [],
}: EntityFormOptions<TValues>) {
  const queryClient = useQueryClient()
  const form = useForm<TValues>({
    resolver: zodResolver(schema) as unknown as Resolver<TValues>,
    defaultValues,
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: async (_data, values) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
      toast.success(successMessage(values))
      onDone()
    },
    onError: (error) => applyServerError(form, error, fieldMatchers),
  })

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
