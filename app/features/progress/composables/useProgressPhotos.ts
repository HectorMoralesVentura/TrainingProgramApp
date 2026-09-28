import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Paginated } from '~/shared/types/api.types'
import type { ProgressPhoto } from '~/features/progress/types/progress.types'

/** Fotos de progreso, más reciente primero (20 por página). */
export function useProgressPhotos(page: MaybeRefOrGetter<number>) {
  const { $api } = useNuxtApp()

  const query = useQuery({
    queryKey: computed(() => ['progress', 'photos', toValue(page)]),
    queryFn: () => $api<Paginated<ProgressPhoto>>('/api/progress/photos/', {
      query: { page: toValue(page) },
    }),
    placeholderData: keepPreviousData,
    // Las URLs son firmadas y caducan: se refrescan antes de que expiren.
    staleTime: 1000 * 60 * 10,
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
