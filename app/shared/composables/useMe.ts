import { useQuery } from '@tanstack/vue-query'
import type { AuthUser } from '~/shared/types/auth.types'

/**
 * Datos del usuario actual. Se usa para refrescar la URL firmada de la foto de perfil,
 * que caduca y no conviene confiar solo en la guardada en la cookie.
 */
export function useMe() {
  const { $api } = useNuxtApp()
  const { isLoggedIn, setPhotoUrl } = useAuth()

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const me = await $api<AuthUser>('/api/auth/me/')
      setPhotoUrl(me.photo_url ?? null)
      return me
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 30,
  })

  const errorMessage = computed(() =>
    query.error.value ? parseFetchError(query.error.value) : '',
  )

  return { ...query, errorMessage }
}
