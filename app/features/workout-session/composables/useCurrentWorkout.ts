import { useQuery } from '@tanstack/vue-query'
import type { Workout } from '~/features/workout-session/types/workout.types'

export const CURRENT_WORKOUT_KEY = ['training', 'workout', 'current'] as const

/** Entrenamiento en curso: Workout o null (el backend responde 204 si no hay). */
export function useCurrentWorkout() {
  const { $api } = useNuxtApp()
  const { isLoggedIn } = useAuth()

  const query = useQuery({
    queryKey: CURRENT_WORKOUT_KEY,
    queryFn: async () => (await $api<Workout | undefined>('/api/progress/workouts/current/')) || null,
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
