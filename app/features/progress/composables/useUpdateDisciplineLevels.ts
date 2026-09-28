import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { DisciplineLevel } from '~/features/progress/types/progress.types'

export function useUpdateDisciplineLevels() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (payload: DisciplineLevel[]) =>
      $api<DisciplineLevel[]>('/api/progress/levels/', { method: 'PUT', body: payload }),

    // Actualización optimista: el selector responde al instante y se revierte si falla.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: DISCIPLINE_LEVELS_KEY })
      const previous = queryClient.getQueryData<DisciplineLevel[]>(DISCIPLINE_LEVELS_KEY)
      const merged = [...(previous ?? [])]
      for (const item of payload) {
        const index = merged.findIndex(l => l.discipline === item.discipline)
        if (index >= 0) merged[index] = item
        else merged.push(item)
      }
      queryClient.setQueryData(DISCIPLINE_LEVELS_KEY, merged)
      return { previous }
    },

    onSuccess: async (levels) => {
      queryClient.setQueryData(DISCIPLINE_LEVELS_KEY, levels)
      // Cambian user_level y suggested_weight_kg de los ejercicios.
      await queryClient.invalidateQueries({ queryKey: ['training', 'exercises'] })
      toast.add({
        title: t('progress.levels.savedTitle'),
        description: t('progress.levels.savedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },

    onError: (error, _payload, context) => {
      queryClient.setQueryData(DISCIPLINE_LEVELS_KEY, context?.previous)
      toast.add({
        title: t('progress.levels.errorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
