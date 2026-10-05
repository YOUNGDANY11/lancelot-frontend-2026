export interface Competency {
  id_competency: number
  id_category: number
  name: string
  description?: string | null
  start_date: string
  finish_date?: string | null
  id_season: number
}

export interface CompetencyRequest {
  id_category: number
  name: string
  description?: string
  start_date: string
  finish?: string
  id_season: number
}

export interface Match {
  id_match: number
  id_competency: number
  id_category: number
  date: string
  time: string
  location: string
  name_category?: string
  name_competency?: string
}

export interface MatchRequest {
  id_competency: number
  id_category: number
  date: string
  time: string
  location: string
}

export interface CallUp {
  id_ath_comp: number
  id_user: number
  id_competency: number
  name?: string
  lastname?: string
  name_competency?: string
}

export interface CreateCallUpRequest {
  id_user: number
  id_competency: number
}
