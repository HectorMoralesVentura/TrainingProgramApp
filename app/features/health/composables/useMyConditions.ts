import { useQuery } from '@tanstack/vue-query'
import type { UserCondition } from '~/features/health/types/health.types'

export function useMyConditions() {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['health', 'my-conditions', locale.value]),
    queryFn: () => $api<UserCondition[]>('/api/health/my-conditions/'),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
