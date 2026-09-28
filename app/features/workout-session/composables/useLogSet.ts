import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { LogSetPayload, Workout } from '~/features/workout-session/types/workout.types'

interface LogSetInput {
  workoutId: number
  logId: number
  body: LogSetPayload
}

export function useLogSet() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ workoutId, logId, body }: LogSetInput) =>
      $api<Workout>(`/api/progress/workouts/${workoutId}/exercises/${logId}/sets/`, { method: 'POST', body }),
    // Sin toast de éxito: se registra una serie cada pocos minutos y la pantalla ya muestra el avance.
    onSuccess: (workout) => {
      queryClient.setQueryData(CURRENT_WORKOUT_KEY, workout)
    },
    onError: (error) => {
      toast.add({ title: t('session.errors.logSetTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
