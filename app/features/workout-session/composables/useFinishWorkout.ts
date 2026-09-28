import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { WorkoutReport } from '~/features/workout-session/types/workout.types'

export function useFinishWorkout() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ workoutId, perceived_effort, notes }: { workoutId: number, perceived_effort?: number | null, notes?: string }) =>
      $api<WorkoutReport>(`/api/progress/workouts/${workoutId}/finish/`, {
        method: 'POST',
        body: { perceived_effort: perceived_effort ?? undefined, notes: notes || undefined },
      }),
    onSuccess: async (report) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, null)
      queryClient.setQueryData(['training', 'reports', report.id], report)
      await invalidateWorkoutHistory(queryClient)
      toast.add({ title: t('session.toasts.finishedTitle'), description: t('session.toasts.finishedDescription'), color: 'success', icon: 'i-lucide-trophy' })
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.finishTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
