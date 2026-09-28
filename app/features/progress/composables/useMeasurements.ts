import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Paginated } from '~/shared/types/api.types'
import type { Measurement } from '~/features/progress/types/progress.types'

/** Historial de medidas, más reciente primero (20 por página). */
export function useMeasurements(page: MaybeRefOrGetter<number>) {
  const { $api } = useNuxtApp()

  const query = useQuery({
    queryKey: computed(() => ['progress', 'measurements', toValue(page)]),
    queryFn: () => $api<Paginated<Measurement>>('/api/progress/measurements/', {
      query: { page: toValue(page) },
    }),
    placeholderData: keepPreviousData,
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
