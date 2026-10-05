import { createContext } from 'react'
import type { Season } from '@/types/club'

export interface ContextCategory {
  id_category: number
  name: string
}

export interface AppContextValue {
  seasons: Season[]
  categories: ContextCategory[]
  season: Season | null
  activeSeason: Season | null
  category: ContextCategory | null
  canChooseCategory: boolean
  setSeasonId: (seasonId: number) => void
  setCategoryId: (categoryId: number | null) => void
  isLoading: boolean
  isError: boolean
  retry: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)
