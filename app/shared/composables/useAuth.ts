import type {
  AuthFirebaseRequest,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthSession,
} from '~/shared/types/auth.types'

export function useAuth() {
  const apiBaseUrl = useApiBaseUrl()
  const { public: { apiAuthPath, apiAuthLogoutPath, apiFirebaseAuthPath } } = useRuntimeConfig()

  const session = useCookie<AuthSession | null>('auth_session', {
    default: () => null,
    sameSite: 'lax',
  })

  const user = computed(() => session.value?.user ?? null)
  const token = computed(() => session.value?.token ?? null)
  const username = computed(() => session.value?.username ?? null)
  const photoUrl = computed(() => session.value?.user?.photo_url ?? null)
  const isLoggedIn = computed(() => session.value?.token != null)

  function saveSession(data: AuthLoginResponse, fallbackUsername: string) {
    // El username se guarda junto al token; si el backend no lo devuelve, se usa el que escribió el usuario.
    session.value = {
      token: data.token,
      username: data.user?.username ?? data.username ?? fallbackUsername,
      user: data.user ?? null,
    }
  }

  async function login(username: string, password: string) {
    const body: AuthLoginRequest = { username, password }

    // Dejamos propagar el FetchError original: la UI lo formatea con parseFetchError.
    const data = await $fetch<AuthLoginResponse>(apiAuthPath as string, {
      baseURL: apiBaseUrl,
      method: 'POST',
      body,
    })
    saveSession(data, username)
  }

  /** Intercambia el ID token de Firebase por el token de Django (mismo formato que el login normal). */
  async function loginWithFirebase(idToken: string) {
    const body: AuthFirebaseRequest = { id_token: idToken }
    const data = await $fetch<AuthLoginResponse>(apiFirebaseAuthPath as string, {
      baseURL: apiBaseUrl,
      method: 'POST',
      body,
    })
    saveSession(data, '')
  }

  function setPhotoUrl(url: string | null) {
    if (!session.value) return
    session.value = {
      ...session.value,
      user: session.value.user ? { ...session.value.user, photo_url: url } : null,
    }
  }

  async function logout() {
    // Se toman antes de cualquier await: después se pierde el contexto de Nuxt.
    const nuxtApp = useNuxtApp()
    const { signOut: firebaseSignOut } = useFirebase()
    try {
      if (token.value) {
        await $fetch(apiAuthLogoutPath as string, {
          baseURL: apiBaseUrl,
          method: 'POST',
          headers: { Authorization: `Token ${token.value}` },
        })
      }
      await firebaseSignOut()
    } catch {
      // Si el backend o Firebase fallan, igual cerramos la sesión local.
    } finally {
      session.value = null
      // Que el siguiente usuario no vea datos en caché del anterior.
      nuxtApp.$queryClient.clear()
      await navigateTo('/login')
    }
  }

  return { session, user, token, username, photoUrl, isLoggedIn, login, loginWithFirebase, setPhotoUrl, logout }
}
