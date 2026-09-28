import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useDeleteMyCondition() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: number) =>
      $api(`/api/health/my-conditions/${id}/`, { method: 'DELETE' }),
    onSuccess: async () => {
      await invalidateHealthDependents(queryClient)
      toast.add({
        title: t('health.myConditions.deletedTitle'),
        description: t('health.myConditions.deletedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('health.myConditions.deleteErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
