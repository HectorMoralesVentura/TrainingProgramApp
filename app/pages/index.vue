<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { username, photoUrl } = useAuth()

useSeoMeta({
  title: () => t('home.title'),
})
</script>

<template>
  <UContainer class="py-16">
    <div class="flex flex-col items-center text-center gap-4">
      <UAvatar :src="photoUrl ?? undefined" :alt="username ?? ''" size="3xl" />
      <h1 class="text-3xl lg:text-4xl font-bold text-highlighted">
        {{ t('home.welcome', { username }) }}
      </h1>
      <p class="text-muted">
        {{ t('home.subtitle') }}
      </p>
      <UButton
        to="/training"
        size="xl"
        icon="i-lucide-dumbbell"
        trailing-icon="i-lucide-chevron-right"
        class="mt-2"
        :label="t('training.home.cta')"
      />
    </div>
  </UContainer>
</template>
