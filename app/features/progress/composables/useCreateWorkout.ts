import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Workout, WorkoutPayload } from '~/features/progress/types/progress.types'

export function useCreateWorkout() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (payload: WorkoutPayload) =>
      $api<Workout>('/api/progress/workouts/', { method: 'POST', body: payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['progress', 'workouts'] })
      toast.add({
        title: t('progress.workouts.createdTitle'),
        description: t('progress.workouts.createdDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('progress.workouts.errorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
