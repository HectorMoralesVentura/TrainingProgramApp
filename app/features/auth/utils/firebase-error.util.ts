// Se detecta por el código ("auth/...") para no cargar el SDK de Firebase solo por esta comprobación.
export function isFirebaseError(error: unknown): error is Error & { code: string } {
  if (!(error instanceof Error) || !('code' in error)) return false
  return typeof error.code === 'string' && error.code.startsWith('auth/')
}

// Cerrar el popup no es un error que haya que mostrar.
const IGNORED = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'])

const MESSAGES: Record<string, string> = {
  'auth/popup-blocked': 'auth.google.errors.popupBlocked',
  'auth/network-request-failed': 'auth.google.errors.network',
  'auth/account-exists-with-different-credential': 'auth.google.errors.accountExists',
  'auth/unauthorized-domain': 'auth.google.errors.unauthorizedDomain',
  'auth/operation-not-allowed': 'auth.google.errors.notEnabled',
}

/** Clave i18n del mensaje para un código de Firebase Auth, o null si no hay que mostrar nada. */
export function firebaseAuthErrorKey(code: string): string | null {
  if (IGNORED.has(code)) return null
  return MESSAGES[code] ?? 'auth.google.errors.generic'
}
