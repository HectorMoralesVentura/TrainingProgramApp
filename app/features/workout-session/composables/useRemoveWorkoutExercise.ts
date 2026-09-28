import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Workout } from '~/features/workout-session/types/workout.types'

/** Quita un ejercicio que aún no tiene series (409 si ya tiene). */
export function useRemoveWorkoutExercise() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ workoutId, logId }: { workoutId: number, logId: number }) =>
      $api<Workout>(`/api/progress/workouts/${workoutId}/exercises/${logId}/`, { method: 'DELETE' }),
    onSuccess: (workout) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, workout)
      toast.add({ title: t('session.toasts.exerciseRemovedTitle'), color: 'success', icon: 'i-lucide-check' })
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.removeExerciseTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
