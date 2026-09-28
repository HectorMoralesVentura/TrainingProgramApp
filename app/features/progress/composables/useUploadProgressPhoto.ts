import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ProgressPhoto, ProgressPhotoPayload } from '~/features/progress/types/progress.types'

export function useUploadProgressPhoto() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  return useMutation({
    mutationFn: ({ file, taken_at, note }: ProgressPhotoPayload) => {
      const body = new FormData()
      body.append('file', file)
      if (taken_at) body.append('taken_at', taken_at)
      if (note) body.append('note', note)
      return $api<ProgressPhoto>('/api/progress/photos/', { method: 'POST', body })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['progress', 'photos'] })
      toast.add({
        title: t('progress.photos.uploadedTitle'),
        description: t('progress.photos.uploadedDescription'),
        color: 'success',
        icon: 'i-lucide-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: t('progress.photos.uploadErrorTitle'),
        description: parseFetchError(error),
        color: 'error',
      })
    },
  })
}
