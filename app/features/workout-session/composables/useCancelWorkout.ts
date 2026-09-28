import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Workout } from '~/features/workout-session/types/workout.types'

export function useCancelWorkout() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (workoutId: number) =>
      $api<Workout>(`/api/progress/workouts/${workoutId}/cancel/`, { method: 'POST' }),
    onSuccess: async () => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, null)
      await invalidateWorkoutHistory(queryClient)
      toast.add({ title: t('session.toasts.cancelledTitle'), color: 'success', icon: 'i-lucide-check' })
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.cancelTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
