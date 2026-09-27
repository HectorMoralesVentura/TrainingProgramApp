<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { username } = useAuth()

useSeoMeta({
  title: () => t('home.title'),
})
</script>

<template>
  <UContainer class="py-16">
    <div class="flex flex-col items-center text-center gap-4">
      <UAvatar :alt="username ?? ''" size="3xl" />
      <h1 class="text-3xl lg:text-4xl font-bold text-highlighted">
        {{ t('home.welcome', { username }) }}
      </h1>
      <p class="text-muted">
        {{ t('home.subtitle') }}
      </p>
    </div>
  </UContainer>
</template>
