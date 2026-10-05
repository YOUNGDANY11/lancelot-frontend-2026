import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { APP_MODULES } from '@/constants/navigation'
import { useAppContext } from '@/hooks/useAppContext'
import { queryKeys } from '@/lib/queryKeys'
import { trainingService } from '@/services/trainingService'
import type { TeamAcwrAthlete } from '@/types/training'
import { todayApiDate } from '@/utils/formatDate'
import { parseApiError } from '@/utils/parseApiError'

export function useTeamLoadController() {
  const { category, categories } = useAppContext()
  const navigate = useNavigate()
  const [localCategoryId, setLocalCategoryId] = useState<number | null>(null)
  const [date, setDate] = useState(todayApiDate())
  const idCategory = category?.id_category ?? localCategoryId ?? categories[0]?.id_category ?? null

  const query = useQuery({
    queryKey: queryKeys.training.teamAcwr(idCategory ?? 0, date),
    queryFn: () => trainingService.categoryAcwr(idCategory ?? 0, date),
    enabled: idCategory !== null,
  })

  const athletes = query.data?.athletes ?? []

  return {
    canChooseCategory: !category && categories.length > 1,
    categoryOptions: categories.map((item) => ({
      value: String(item.id_category),
      label: item.name,
    })),
    categoryValue: idCategory !== null ? String(idCategory) : undefined,
    onCategoryChange: (value: string) => setLocalCategoryId(Number(value)),
    hasCategories: categories.length > 0,
    date,
    setDate: (value: string) => value && setDate(value),
    isLoading: idCategory !== null && query.isPending,
    errorMessage: query.isError ? parseApiError(query.error) : undefined,
    retry: () => void query.refetch(),
    team: query.data,
    athletes,
    withAcwr: athletes.filter((athlete) => athlete.acwr !== null),
    withoutData: athletes.filter((athlete) => athlete.acwr === null).length,
    openAthlete: (athlete: TeamAcwrAthlete) =>
      navigate(`${APP_MODULES.athletes.path}/${athlete.id_user}?tab=carga`),
  }
}
