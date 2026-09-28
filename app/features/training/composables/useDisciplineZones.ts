import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { FocusZone } from '~/features/training/types/training.types'

export function useDisciplineZones(disciplineSlug: MaybeRefOrGetter<string>) {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['training', 'zones', toValue(disciplineSlug), locale.value]),
    queryFn: () => $api<FocusZone[]>(`/api/catalog/disciplines/${toValue(disciplineSlug)}/zones/`),
    enabled: computed(() => !!toValue(disciplineSlug)),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
