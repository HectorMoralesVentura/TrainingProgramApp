import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ExerciseLevel } from '~/features/training/types/training.types'
import type { Workout } from '~/features/workout-session/types/workout.types'

export function useAddWorkoutExercise() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ workoutId, exercise, level }: { workoutId: number, exercise: string, level?: ExerciseLevel }) =>
      $api<Workout>(`/api/progress/workouts/${workoutId}/exercises/`, { method: 'POST', body: { exercise, level } }),
    onSuccess: (workout) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, workout)
      toast.add({ title: t('session.toasts.exerciseAddedTitle'), color: 'success', icon: 'i-lucide-check' })
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.addExerciseTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
