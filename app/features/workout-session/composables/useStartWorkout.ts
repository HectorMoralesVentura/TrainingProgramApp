import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { FetchError } from 'ofetch'
import type { Workout, WorkoutStartPayload } from '~/features/workout-session/types/workout.types'

/** 409 = ya hay un entrenamiento en curso (la UI ofrece continuarlo o cancelarlo). */
export function isWorkoutConflict(error: unknown) {
  return error instanceof FetchError && error.status === 409
}

export function useStartWorkout() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (payload: WorkoutStartPayload) =>
      $api<Workout>('/api/progress/workouts/start/', { method: 'POST', body: payload }),
    onSuccess: (workout) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, workout)
      toast.add({ title: t('session.toasts.startedTitle'), description: t('session.toasts.startedDescription'), color: 'success', icon: 'i-lucide-play' })
    },
    onError: (error) => {
      // El conflicto lo resuelve la pantalla con un diálogo (continuar o cancelar el anterior).
      if (isWorkoutConflict(error)) return
      toast.add({ title: t('session.errors.startTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
