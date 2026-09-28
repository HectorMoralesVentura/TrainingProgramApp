import { useQuery } from '@tanstack/vue-query'
import type { MedicalCondition } from '~/features/health/types/health.types'

/** Catálogo de condiciones médicas / lesiones. */
export function useConditions() {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['health', 'conditions', locale.value]),
    queryFn: () => $api<MedicalCondition[]>('/api/health/conditions/'),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
