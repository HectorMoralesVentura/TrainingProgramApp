import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UserCondition, UserConditionPayload } from '~/features/health/types/health.types'

export function useAddMyCondition() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (payload: UserConditionPayload) =>
      $api<UserCondition>('/api/health/my-conditions/', { method: 'POST', body: payload }),
    onSuccess: async () => {
      // Las condiciones cambian qué ejercicios y zonas ve el usuario.
      await invalidateHealthDependents(queryClient)
      toast.add({
        title: t('health.myConditions.createdTitle'),
        description: t('health.myConditions.createdDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('health.myConditions.createErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
