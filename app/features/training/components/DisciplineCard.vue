<script setup lang="ts">
import type { Discipline } from '~/features/training/types/training.types'

defineProps<{ discipline: Discipline }>()

const { t } = useI18n()
</script>

<template>
  <ULink
    :to="`/training/${discipline.slug}`"
    class="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <UCard
      class="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-primary/50"
      :ui="{ body: 'flex flex-col gap-4 p-5 sm:p-6' }"
    >
      <div class="flex items-start justify-between">
        <div class="size-14 rounded-2xl flex items-center justify-center" :class="disciplineAccent(discipline.slug)">
          <UIcon :name="discipline.icon" class="size-7" />
        </div>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-5 text-dimmed transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>

      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-highlighted">
          {{ discipline.name }}
        </h2>
        <p class="text-sm text-muted">
          {{ discipline.description }}
        </p>
      </div>

      <UBadge
        color="neutral"
        variant="subtle"
        icon="i-lucide-crosshair"
        class="self-start"
        :label="t('training.discipline.zones', discipline.zone_count)"
      />
    </UCard>
  </ULink>
</template>
