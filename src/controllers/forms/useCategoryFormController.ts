import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { queryKeys } from '@/lib/queryKeys'
import {
  categorySchema,
  toCreateCategoryRequest,
  type CategoryFormValues,
} from '@/schemas/clubSchemas'
import { categoriesService } from '@/services/categoriesService'
import type { Category } from '@/types/club'

interface CategoryFormOptions {
  onDone: () => void
  category?: Category | null
}

export function useCategoryFormController({ onDone, category }: CategoryFormOptions) {
  const isEditing = Boolean(category)

  return {
    isEditing,
    ...useEntityFormController<CategoryFormValues>({
      schema: categorySchema,
      defaultValues: category
        ? {
            name: category.name,
            min_age: String(category.min_age),
            max_age: String(category.max_age),
          }
        : { name: '', min_age: '', max_age: '' },
      submit: (values) =>
        category
          ? categoriesService.update(category.id_category, toCreateCategoryRequest(values))
          : categoriesService.create(toCreateCategoryRequest(values)),
      invalidate: [queryKeys.categories.all],
      successMessage: (values) =>
        isEditing ? `Categoría ${values.name} actualizada.` : `Categoría ${values.name} creada.`,
      onDone,
      fieldMatchers: [{ field: 'name', pattern: /nombre/i }],
    }),
  }
}
