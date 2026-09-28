import type { QueryClient } from '@tanstack/vue-query'

/** Tras terminar o cancelar: historial y reportes se recalculan. */
export function invalidateWorkoutHistory(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['training', 'workouts'] }),
    queryClient.invalidateQueries({ queryKey: ['training', 'reports'] }),
    // La lista del historial usa esta clave.
    queryClient.invalidateQueries({ queryKey: ['progress', 'workouts'] }),
  ])
}
