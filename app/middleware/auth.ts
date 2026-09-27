/**
 * Route guard for protected pages.
 *
 * Opt in per-page with:
 *   definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      // Remember where the user wanted to go, so we can send them back.
      query: { redirect: to.fullPath },
    })
  }
})
