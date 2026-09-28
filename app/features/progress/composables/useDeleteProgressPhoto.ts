import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useDeleteProgressPhoto() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: (id: number) => $api(`/api/progress/photos/${id}/`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['progress', 'photos'] })
      toast.add({
        title: t('progress.photos.deletedTitle'),
        description: t('progress.photos.deletedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('progress.photos.deleteErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
