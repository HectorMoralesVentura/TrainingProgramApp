import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Measurement, MeasurementPayload } from '~/features/progress/types/progress.types'

/** Una medida por día: si ya existe la de esa fecha el backend la actualiza y responde 200 en vez de 201. */
export function useSaveMeasurement() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: async (payload: MeasurementPayload) => {
      const response = await $api.raw<Measurement>('/api/progress/measurements/', {
        method: 'POST',
        body: payload,
      })
      return { measurement: response._data!, updated: response.status === 200 }
    },
    onSuccess: async ({ updated }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['progress', 'measurements'] }),
        // El peso sugerido se recalcula con la medida nueva.
        queryClient.invalidateQueries({ queryKey: ['training', 'exercises'] }),
      ])
      toast.add({
        title: updated ? t('progress.measurements.updatedTitle') : t('progress.measurements.createdTitle'),
        description: t('progress.measurements.savedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('progress.measurements.errorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
