import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/queryKeys'
import {
  categorySchema,
  toCreateCategoryRequest,
  type CategoryFormValues,
} from '@/schemas/clubSchemas'
import { categoriesService } from '@/services/categoriesService'
import { applyServerError, serverErrorOf } from '@/utils/formErrors'

const EMPTY_CATEGORY: CategoryFormValues = { name: '', min_age: '', max_age: '' }

export function useCategoryFormController({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY_CATEGORY,
    mode: 'onTouched',
  })

  const mutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      categoriesService.create(toCreateCategoryRequest(values)),
    onSuccess: async (category) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
      toast.success(`Categoría ${category.name} creada.`)
      form.reset(EMPTY_CATEGORY)
      onDone()
    },
    onError: (error) => applyServerError(form, error, [{ field: 'name', pattern: /nombre/i }]),
  })

  return {
    form,
    onSubmit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    serverError: serverErrorOf(form),
  }
}
