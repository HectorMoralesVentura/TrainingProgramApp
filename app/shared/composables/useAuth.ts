import type { AuthLoginRequest, AuthLoginResponse, AuthSession } from '~/shared/types/auth.types'

export function useAuth() {
  const apiBaseUrl = useApiBaseUrl()
  const { public: { apiAuthPath, apiAuthLogoutPath } } = useRuntimeConfig()

  const session = useCookie<AuthSession | null>('auth_session', {
    default: () => null,
    sameSite: 'lax',
  })

  const user = computed(() => session.value?.user ?? null)
  const token = computed(() => session.value?.token ?? null)
  const username = computed(() => session.value?.username ?? null)
  const isLoggedIn = computed(() => session.value?.token != null)

  async function login(username: string, password: string) {
    const body: AuthLoginRequest = { username, password }

    // Dejamos propagar el FetchError original: la UI lo formatea con parseFetchError.
    const data = await $fetch<AuthLoginResponse>(apiAuthPath as string, {
      baseURL: apiBaseUrl,
      method: 'POST',
      body,
    })

    // El username se guarda junto al token; si el backend no lo devuelve, se usa el que escribió el usuario.
    session.value = {
      token: data.token,
      username: data.user?.username ?? data.username ?? username,
      user: data.user ?? null,
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await $fetch(apiAuthLogoutPath as string, {
          baseURL: apiBaseUrl,
          method: 'POST',
          headers: { Authorization: `Token ${token.value}` },
        })
      }
    } catch {
      // Si el backend falla, igual cerramos la sesión local.
    } finally {
      session.value = null
      await navigateTo('/login')
    }
  }

  return { session, user, token, username, isLoggedIn, login, logout }
}
