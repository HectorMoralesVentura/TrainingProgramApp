import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { WorkoutSummary, WorkoutSummaryFilters } from '~/features/workout-session/types/workout.types'

/** Resumen de entrenamientos terminados (filtros opcionales). */
export function useWorkoutSummary(filters: MaybeRefOrGetter<WorkoutSummaryFilters>) {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['training', 'reports', 'summary', { ...toValue(filters) }, locale.value]),
    queryFn: () => {
      const { discipline, date_from, date_to } = toValue(filters)
      return $api<WorkoutSummary>('/api/progress/reports/summary/', {
        query: { discipline: discipline || undefined, date_from: date_from || undefined, date_to: date_to || undefined },
      })
    },
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
