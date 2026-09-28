import type { Auth } from 'firebase/auth'

/**
 * Cliente web de Firebase (solo Auth). El SDK se carga bajo demanda para no inflar el bundle inicial.
 * Si la config pública no está en el .env, `isEnabled` es false y la app funciona sin Firebase.
 */
export function useFirebase() {
  const { public: { firebase } } = useRuntimeConfig()

  const isEnabled = computed(() =>
    !!(firebase.apiKey && firebase.authDomain && firebase.projectId && firebase.appId),
  )

  async function getFirebaseAuth(): Promise<Auth> {
    const [{ initializeApp, getApps }, { getAuth }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
    ])
    const app = getApps()[0] ?? initializeApp({ ...firebase })
    return getAuth(app)
  }

  /** Abre el popup de Google y devuelve el ID token que el backend verifica con firebase-admin. */
  async function signInWithGoogle(): Promise<string> {
    const auth = await getFirebaseAuth()
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(auth, provider)
    return credential.user.getIdToken()
  }

  async function signOut() {
    if (!isEnabled.value) return
    const auth = await getFirebaseAuth()
    const { signOut: firebaseSignOut } = await import('firebase/auth')
    await firebaseSignOut(auth)
  }

  return { isEnabled, signInWithGoogle, signOut }
}
