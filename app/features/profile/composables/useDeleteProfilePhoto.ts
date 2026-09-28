import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useDeleteProfilePhoto() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()
  const { setPhotoUrl } = useAuth()

  return useMutation({
    mutationFn: () => $api('/api/auth/me/photo/', { method: 'DELETE' }),
    onSuccess: async () => {
      setPhotoUrl(null)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.add({
        title: t('profile.photo.deletedTitle'),
        description: t('profile.photo.deletedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('profile.photo.deleteErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
