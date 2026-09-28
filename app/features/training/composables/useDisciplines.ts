import { useQuery } from '@tanstack/vue-query'
import type { Discipline } from '~/features/training/types/training.types'

export function useDisciplines() {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['training', 'disciplines', locale.value]),
    queryFn: () => $api<Discipline[]>('/api/catalog/disciplines/'),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
