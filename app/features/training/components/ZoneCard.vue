<script setup lang="ts">
import type { FocusZone } from '~/features/training/types/training.types'

defineProps<{ zone: FocusZone, disciplineSlug: string }>()

const { t } = useI18n()
</script>

<template>
  <ULink
    :to="`/training/${disciplineSlug}/${zone.slug}`"
    class="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <UCard
      class="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-primary/50"
      :ui="{ body: 'flex flex-col items-center text-center gap-3 p-4 sm:p-5' }"
    >
      <div
        class="size-12 sm:size-14 rounded-full flex items-center justify-center transition-colors duration-200"
        :class="disciplineAccent(disciplineSlug)"
      >
        <UIcon name="i-lucide-crosshair" class="size-6 sm:size-7" />
      </div>
      <div class="space-y-0.5">
        <h2 class="font-semibold text-highlighted">
          {{ zone.name }}
        </h2>
        <p class="text-xs text-muted">
          {{ t('training.zone.exercises', zone.exercise_count) }}
        </p>
      </div>
    </UCard>
  </ULink>
</template>
