import { SEASON_STATUS } from '@/constants/enums'
import { useAppContext } from '@/hooks/useAppContext'

export const ALL_CATEGORIES_VALUE = 'todas'

export function useContextSwitcherController() {
  const {
    seasons,
    categories,
    season,
    category,
    canChooseCategory,
    setSeasonId,
    setCategoryId,
    isLoading,
  } = useAppContext()

  const seasonOptions = seasons.map((item) => ({
    value: String(item.id_season),
    label:
      item.status === 'active' ? item.name : `${item.name} (${SEASON_STATUS.labels[item.status]})`,
  }))

  const categoryOptions = [
    { value: ALL_CATEGORIES_VALUE, label: 'Todas las categorías' },
    ...categories.map((item) => ({ value: String(item.id_category), label: item.name })),
  ]

  return {
    isLoading,
    hasSeasons: seasons.length > 0,
    seasonValue: season ? String(season.id_season) : undefined,
    seasonOptions,
    seasonLabel: season?.name ?? 'Sin temporada',
    onSeasonChange: (value: string) => setSeasonId(Number(value)),
    canChooseCategory,
    categoryValue: category ? String(category.id_category) : ALL_CATEGORIES_VALUE,
    categoryOptions,
    categoryLabel: category?.name ?? (canChooseCategory ? 'Todas las categorías' : 'Sin categoría'),
    onCategoryChange: (value: string) =>
      setCategoryId(value === ALL_CATEGORIES_VALUE ? null : Number(value)),
  }
}
