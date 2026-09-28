<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import type { FormSubmitEvent } from '@nuxt/ui'
import CentipedeCanvas from '~/features/auth/components/CentipedeCanvas.vue'

type LoginForm = { username: string, password: string }
type FieldName = keyof LoginForm

const { t } = useI18n()
const { login, loginWithFirebase, isLoggedIn } = useAuth()
const route = useRoute()

if (isLoggedIn.value) {
  await navigateTo('/')
}

const schema = computed(() =>
  z.object({
    username: z.string({ error: t('auth.validation.username') }).trim().min(1, t('auth.validation.username')),
    password: z.string({ error: t('auth.validation.password') }).min(1, t('auth.validation.password')),
  }),
)

const state = reactive<LoginForm>({ username: '', password: '' })
const showPassword = ref(false)

// Estado visual de cada campo: enfocado, ya visitado y animación de error.
const focused = ref<FieldName | null>(null)
const touched = reactive<Record<FieldName, boolean>>({ username: false, password: false })
const shaking = reactive<Record<FieldName, boolean>>({ username: false, password: false })

const fields = computed(() => [
  {
    name: 'username' as const,
    label: t('auth.login.username'),
    placeholder: t('auth.login.usernamePlaceholder'),
    icon: 'i-lucide-user',
    autocomplete: 'username',
  },
  {
    name: 'password' as const,
    label: t('auth.login.password'),
    placeholder: t('auth.login.passwordPlaceholder'),
    icon: 'i-lucide-lock',
    autocomplete: 'current-password',
  },
])

function isEmpty(name: FieldName) {
  return state[name].trim().length === 0
}

// Rojo solo después de que el usuario pasó por el campo (o intentó enviar), no al cargar la página.
function isInvalid(name: FieldName) {
  return touched[name] && isEmpty(name)
}

function shake(name: FieldName) {
  shaking[name] = false
  requestAnimationFrame(() => {
    shaking[name] = true
    setTimeout(() => (shaking[name] = false), 450)
  })
}

function onFocus(name: FieldName) {
  focused.value = name
}

function onBlur(name: FieldName) {
  focused.value = null
  touched[name] = true
  if (isEmpty(name)) shake(name)
}

function inputClass(name: FieldName) {
  return [
    'w-full transition-[scale] duration-200',
    focused.value === name && !isInvalid(name) && 'motion-safe:scale-[1.02]',
    shaking[name] && 'motion-safe:animate-shake',
  ]
}

function inputUi(name: FieldName) {
  const invalid = isInvalid(name)
  const active = focused.value === name
  return {
    base: [
      'transition-shadow duration-200',
      invalid && 'bg-error/5 shadow-lg shadow-error/20',
      !invalid && active && 'shadow-lg shadow-primary/25',
    ],
    leadingIcon: [
      'transition-colors duration-200',
      invalid ? 'text-error' : active ? 'text-primary' : '',
    ],
  }
}

function labelUi(name: FieldName) {
  return {
    label: [
      'transition-colors duration-200',
      isInvalid(name) ? 'text-error' : focused.value === name ? 'text-primary' : '',
    ],
  }
}

const { mutateAsync, isPending, error, reset: resetPasswordLogin } = useMutation<unknown, unknown, LoginForm>({
  mutationFn: variables => login(variables.username, variables.password),
})

// Google: popup de Firebase -> ID token -> el backend lo verifica y devuelve el token de Django.
const { isEnabled: googleEnabled, signInWithGoogle } = useFirebase()
const googleLogin = useMutation({
  mutationFn: async () => {
    const idToken = await signInWithGoogle()
    await loginWithFirebase(idToken)
  },
})

const loginErrorMessage = computed(() => {
  if (error.value != null) return parseFetchError(error.value)
  const googleError = googleLogin.error.value
  if (googleError == null) return ''
  if (isFirebaseError(googleError)) {
    const key = firebaseAuthErrorKey(googleError.code)
    return key ? t(key) : ''
  }
  return parseFetchError(googleError)
})

async function onGoogleLogin() {
  resetPasswordLogin()
  await googleLogin.mutateAsync().catch(() => undefined)
  if (isLoggedIn.value) {
    const redirect = (route.query.redirect as string) || '/'
    await navigateTo(redirect)
  }
}

function onValidationError() {
  for (const { name } of fields.value) {
    touched[name] = true
    if (isEmpty(name)) shake(name)
  }
}

async function onSubmit(event: FormSubmitEvent<LoginForm>) {
  googleLogin.reset()
  await mutateAsync(event.data)
  const redirect = (route.query.redirect as string) || '/'
  await navigateTo(redirect)
}

definePageMeta({ layout: false })

useSeoMeta({
  title: () => t('auth.login.title'),
})
</script>

<template>
  <div class="min-h-screen grid grid-rows-[14rem_1fr] lg:grid-rows-1 lg:grid-cols-2">
    <!-- Panel de animación -->
    <section class="relative overflow-hidden bg-elevated border-b lg:border-b-0 lg:border-r border-default">
      <CentipedeCanvas class="absolute inset-0 size-full" />
      <div class="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 pointer-events-none">
        <p class="text-2xl lg:text-4xl font-bold text-highlighted">
          {{ t('app.name') }}
        </p>
        <p class="text-sm lg:text-base text-muted mt-1">
          {{ t('auth.login.tagline') }}
        </p>
      </div>
    </section>

    <!-- Panel del formulario -->
    <section class="flex flex-col p-4">
      <header class="flex justify-end">
        <UColorModeButton />
      </header>

      <div class="flex-1 flex items-center justify-center py-8">
        <div class="w-full max-w-md space-y-6">
          <div class="flex flex-col items-center text-center gap-2">
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-dumbbell" class="size-6 text-primary" />
            </div>
            <h1 class="text-xl font-semibold text-highlighted">
              {{ t('auth.login.title') }}
            </h1>
            <p class="text-muted">
              {{ t('auth.login.subtitle') }}
            </p>
          </div>

          <UForm
            :schema="schema"
            :state="state"
            class="space-y-5"
            @submit="onSubmit"
            @error="onValidationError"
          >
            <UFormField
              v-for="field in fields"
              :key="field.name"
              :name="field.name"
              :label="field.label"
              :ui="labelUi(field.name)"
              required
            >
              <UInput
                v-model="state[field.name]"
                :type="field.name === 'password' && !showPassword ? 'password' : 'text'"
                :placeholder="field.placeholder"
                :icon="field.icon"
                :autocomplete="field.autocomplete"
                :color="isInvalid(field.name) ? 'error' : 'primary'"
                :highlight="isInvalid(field.name) || focused === field.name"
                :class="inputClass(field.name)"
                :ui="inputUi(field.name)"
                size="lg"
                @focus="onFocus(field.name)"
                @blur="onBlur(field.name)"
              >
                <template v-if="field.name === 'password'" #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')"
                    :aria-pressed="showPassword"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <UAlert
              v-if="loginErrorMessage"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :title="t('auth.login.errorTitle')"
              :description="loginErrorMessage"
            />

            <UButton
              type="submit"
              size="lg"
              block
              :loading="isPending"
              :disabled="googleLogin.isPending.value"
              :label="t('auth.login.submit')"
            />
          </UForm>

          <!-- Solo aparece si la config web de Firebase está en el .env -->
          <template v-if="googleEnabled">
            <USeparator :label="t('auth.login.or')" />
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              block
              icon="i-simple-icons-google"
              :loading="googleLogin.isPending.value"
              :disabled="isPending"
              :label="t('auth.login.google')"
              @click="onGoogleLogin"
            />
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
