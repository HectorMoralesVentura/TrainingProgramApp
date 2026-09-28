import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import type { Exercise } from '~/features/training/types/training.types'

/** Máximo 6 ejercicios, ya personalizados para el usuario (excluye los prohibidos por sus condiciones). */
export function useZoneExercises(
  disciplineSlug: MaybeRefOrGetter<string>,
  zoneSlug: MaybeRefOrGetter<string>,
) {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()

  const query = useQuery({
    queryKey: computed(() => ['training', 'exercises', toValue(disciplineSlug), toValue(zoneSlug), locale.value]),
    queryFn: () => $api<Exercise[]>(
      `/api/catalog/disciplines/${toValue(disciplineSlug)}/zones/${toValue(zoneSlug)}/exercises/`,
    ),
    enabled: computed(() => !!toValue(disciplineSlug) && !!toValue(zoneSlug)),
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
