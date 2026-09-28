import { useMutation } from '@tanstack/vue-query'
import type { WorkoutPlan, WorkoutSuggestPayload } from '~/features/workout-session/types/workout.types'

/** Sugerencia de ejercicios para las zonas elegidas (no guarda nada en el backend). */
export function useWorkoutSuggest() {
  const { $api } = useNuxtApp()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (payload: WorkoutSuggestPayload) =>
      $api<WorkoutPlan>('/api/progress/workouts/suggest/', { method: 'POST', body: payload }),
    // Sin toast de éxito: al recibir la sugerencia se navega directo a la pantalla del plan.
    onSuccess: () => {},
    onError: (error) => {
      toast.add({ title: t('session.errors.suggestTitle'), description: parseFetchError(error), color: 'error' })
    },
  })
}
