import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Paginated } from '~/shared/types/api.types'
import type { Workout, WorkoutFilters } from '~/features/progress/types/progress.types'

/** Historial de entrenamientos paginado; fechas AAAA-MM-DD inclusivas. */
export function useWorkouts(filters: MaybeRefOrGetter<WorkoutFilters>) {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['progress', 'workouts', { ...toValue(filters) }, locale.value]),
    queryFn: () => {
      const { discipline, date_from, date_to, page } = toValue(filters)
      return $api<Paginated<Workout>>('/api/progress/workouts/', {
        query: {
          page,
          discipline: discipline || undefined,
          date_from: date_from || undefined,
          date_to: date_to || undefined,
        },
      })
    },
    placeholderData: keepPreviousData,
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
