import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useUploadProfilePhoto() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()
  const { setPhotoUrl } = useAuth()

  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return $api<{ photo_url: string }>('/api/auth/me/photo/', { method: 'POST', body })
    },
    onSuccess: async ({ photo_url }) => {
      setPhotoUrl(photo_url)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.add({
        title: t('profile.photo.uploadedTitle'),
        description: t('profile.photo.uploadedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('profile.photo.uploadErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
