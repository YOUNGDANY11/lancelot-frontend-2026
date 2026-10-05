import { POSITION_GROUPS } from '@/constants/positions'
import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { assignmentChangeSchema, type AssignmentChangeFormValues } from '@/schemas/clubSchemas'
import { athleteAssignmentsService } from '@/services/athleteAssignmentsService'
import type { AthleteAssignment } from '@/types/club'
import { fullName } from '@/utils/text'

export function useAssignmentChangeFormController({
  assignment,
  onDone,
}: {
  assignment: AthleteAssignment
  onDone: () => void
}) {
  const { categories } = useAppContext()

  const controller = useEntityFormController<AssignmentChangeFormValues>({
    schema: assignmentChangeSchema,
    defaultValues: {
      id_category: assignment.id_category ? String(assignment.id_category) : '',
      position: assignment.position ?? '',
    },
    submit: (values) =>
      athleteAssignmentsService.update(assignment.id_ath_cat, {
        id_category: Number(values.id_category),
        position: values.position,
      }),
    invalidate: [queryKeys.assignments.all, queryKeys.athlete.all(assignment.id_user)],
    successMessage: (values) => {
      const target = categories.find((item) => item.id_category === Number(values.id_category))
      return `${fullName(assignment)} quedó en ${target?.name ?? 'la nueva categoría'}.`
    },
    onDone,
    fieldMatchers: [{ field: 'id_category', pattern: /categor/i }],
  })

  return {
    ...controller,
    athleteName: fullName(assignment),
    currentCategory: assignment.category_name,
    categoryOptions: categories.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
    positionGroups: POSITION_GROUPS.map((group) => ({
      label: group.label,
      options: group.positions.map((position) => ({ value: position, label: position })),
    })),
  }
}
