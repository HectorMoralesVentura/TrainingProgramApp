import { useQueries } from '@tanstack/vue-query'
import type { FocusZone } from '~/features/training/types/training.types'

/**
 * Zonas de todas las disciplinas como opciones de selección ("Gym · Pecho").
 * Reutiliza la misma queryKey que useDisciplineZones, así que comparte caché.
 */
export function useZoneOptions() {
  const { $api } = useNuxtApp()
  const { locale } = useI18n()
  const { data: disciplines } = useDisciplines()

  const results = useQueries({
    queries: computed(() =>
      (disciplines.value ?? []).map(d => ({
        queryKey: ['training', 'zones', d.slug, locale.value],
        queryFn: () => $api<FocusZone[]>(`/api/catalog/disciplines/${d.slug}/zones/`),
      })),
    ),
  })

  const options = computed(() =>
    (disciplines.value ?? []).flatMap((d, i) =>
      (results.value[i]?.data ?? []).map(z => ({ label: `${d.name} · ${z.name}`, value: z.id })),
    ),
  )

  const isPending = computed(() => !disciplines.value || results.value.some(r => r.isPending))

  return { options, isPending }
}
