import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { WorkoutReport } from '~/features/workout-session/types/workout.types'

/** Reporte de un entrenamiento (parcial si sigue en curso). */
export function useWorkoutReport(workoutId: MaybeRefOrGetter<number | null>) {
  const { $api } = useNuxtApp()

  const query = useQuery({
    queryKey: computed(() => ['training', 'reports', toValue(workoutId)]),
    queryFn: () => $api<WorkoutReport>(`/api/progress/workouts/${toValue(workoutId)}/report/`),
    enabled: computed(() => toValue(workoutId) != null),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
