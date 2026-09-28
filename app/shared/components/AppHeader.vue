<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { t, locale, setLocale } = useI18n()
const { username, photoUrl, logout } = useAuth()

// Refresca la URL firmada de la foto de perfil (caduca).
useMe()

const nextLocale = computed(() => (locale.value === 'es' ? 'en' : 'es'))

const nav = computed(() => [
  { to: '/training', icon: 'i-lucide-dumbbell', label: t('training.nav') },
  { to: '/workouts', icon: 'i-lucide-clipboard-list', label: t('progress.workouts.nav') },
])

const userMenu = computed<DropdownMenuItem[][]>(() => [
  [{ type: 'label', label: username.value ?? '', avatar: { src: photoUrl.value ?? undefined, alt: username.value ?? '' } }],
  [
    { label: t('profile.nav'), icon: 'i-lucide-user', to: '/profile' },
    { label: t('health.nav'), icon: 'i-lucide-heart-pulse', to: '/profile?tab=health' },
  ],
  [{
    label: t('common.changeLanguageTo', { language: nextLocale.value === 'es' ? 'Español' : 'English' }),
    icon: 'i-lucide-languages',
    onSelect: () => setLocale(nextLocale.value),
  }],
  [{ label: t('common.logout'), icon: 'i-lucide-log-out', color: 'error', onSelect: () => logout() }],
])
</script>

<template>
  <header class="sticky top-0 z-20 flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-default bg-default/90 backdrop-blur">
    <div class="flex items-center gap-1 sm:gap-4 min-w-0">
      <ULink to="/" class="font-semibold text-highlighted truncate">
        {{ t('app.name') }}
      </ULink>
      <nav class="flex items-center gap-1" :aria-label="t('common.mainNav')">
        <UButton
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          color="neutral"
          variant="ghost"
          :icon="item.icon"
          active-color="primary"
          active-variant="soft"
          :aria-label="item.label"
        >
          <span class="hidden sm:inline">{{ item.label }}</span>
        </UButton>
      </nav>
    </div>

    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
      <UColorModeButton />
      <UDropdownMenu :items="userMenu" :content="{ align: 'end' }">
        <UButton color="neutral" variant="ghost" :aria-label="t('common.userMenu')" class="gap-2">
          <UAvatar :src="photoUrl ?? undefined" :alt="username ?? ''" size="sm" />
          <span class="hidden md:inline text-sm">{{ username }}</span>
          <UIcon name="i-lucide-chevron-down" class="hidden md:inline size-4 text-muted" />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>
