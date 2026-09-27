<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const { username, logout } = useAuth()

const nextLocale = computed(() => (locale.value === 'es' ? 'en' : 'es'))
</script>

<template>
  <header class="flex items-center justify-between gap-4 px-6 py-3 border-b border-default">
    <ULink to="/" class="font-semibold text-highlighted">
      {{ t('app.name') }}
    </ULink>

    <div class="flex items-center gap-2">
      <span v-if="username" class="text-sm text-muted">{{ username }}</span>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-languages"
        :label="nextLocale.toUpperCase()"
        :aria-label="t('common.changeLanguage')"
        @click="setLocale(nextLocale)"
      />
      <UColorModeButton />
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-log-out"
        :label="t('common.logout')"
        @click="logout"
      />
    </div>
  </header>
</template>
