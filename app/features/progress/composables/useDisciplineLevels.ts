import { useQuery } from '@tanstack/vue-query'
import type { DisciplineLevel } from '~/features/progress/types/progress.types'

export const DISCIPLINE_LEVELS_KEY = ['progress', 'levels'] as const

export function useDisciplineLevels() {
  const { $api } = useNuxtApp()

  const query = useQuery({
    queryKey: DISCIPLINE_LEVELS_KEY,
    queryFn: () => $api<DisciplineLevel[]>('/api/progress/levels/'),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
