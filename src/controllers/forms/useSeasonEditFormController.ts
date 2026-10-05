import { useEntityFormController } from '@/controllers/shared/useEntityFormController'
import { queryKeys } from '@/lib/queryKeys'
import {
  seasonEditSchema,
  toUpdateSeasonRequest,
  type SeasonEditFormValues,
} from '@/schemas/clubSchemas'
import { seasonsService } from '@/services/seasonsService'
import type { Season } from '@/types/club'

export function useSeasonEditFormController({
  season,
  onDone,
}: {
  season: Season
  onDone: () => void
}) {
  return useEntityFormController<SeasonEditFormValues>({
    schema: seasonEditSchema,
    defaultValues: {
      name: season.name,
      start_date: season.start_date.slice(0, 10),
      end_date: season.end_date?.slice(0, 10) ?? '',
      status: season.status,
    },
    submit: (values) => seasonsService.update(season.id_season, toUpdateSeasonRequest(values)),
    invalidate: [queryKeys.seasons.all],
    successMessage: (values) => `Temporada ${values.name} actualizada.`,
    onDone,
    fieldMatchers: [{ field: 'end_date', pattern: /fecha/i }],
  })
}
