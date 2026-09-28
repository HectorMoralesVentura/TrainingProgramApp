import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Workout } from '~/features/workout-session/types/workout.types'

export function useDeleteSet() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ workoutId, logId, setId }: { workoutId: number, logId: number, setId: number }) =>
      $api<Workout>(`/api/progress/workouts/${workoutId}/exercises/${logId}/sets/${setId}/`, { method: 'DELETE' }),
    onSuccess: (workout) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, workout)
      toast.add({ title: t('session.toasts.setDeletedTitle'), color: 'success', icon: 'i-lucide-check' })
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.deleteSetTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
